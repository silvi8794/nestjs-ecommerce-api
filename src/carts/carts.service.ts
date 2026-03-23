import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart, CartStatus, PaymentMethod, DeliveryMethod } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { ProductVariant } from '../products/entities/product-variant.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(ProductVariant)
    private readonly variantRepository: Repository<ProductVariant>,
  ) { }

  async findOrCreateCart(user: User): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: [
        { user: { id: user.id }, status: CartStatus.ACTIVE },
        { user: { id: user.id }, status: CartStatus.PAUSED },
      ],
      relations: ['items', 'items.productVariant'],
    });

    if (!cart) {
      cart = this.cartRepository.create({
        user,
        status: CartStatus.ACTIVE,
        items: [],
        totalAmount: 0,
        deliveryMethod: DeliveryMethod.PICKUP
      });
      await this.cartRepository.save(cart);
    } else if (cart.status === CartStatus.PAUSED) {
      cart.status = CartStatus.ACTIVE;
      await this.cartRepository.save(cart);
    }

    return cart;
  }

  async addItem(user: User, variantId: number, quantity: number) {
    const variant = await this.variantRepository.findOne({ where: { id: variantId } });
    if (!variant) throw new NotFoundException('Variante de producto no encontrada');

    if (variant.stock < quantity) {
      throw new BadRequestException('No hay suficiente stock disponible');
    }

    const cart = await this.findOrCreateCart(user);

    let cartItem = cart.items.find(item => item.productVariant.id === variantId);

    if (cartItem) {
      cartItem.quantity += quantity;
    } else {
      cartItem = this.cartItemRepository.create({
        cart,
        productVariant: variant,
        quantity,
        unitPrice: variant.price,
      });
      cart.items.push(cartItem);
    }

    this.calculateTotal(cart);
    await this.cartRepository.save(cart);
    return cart;
  }

  async pauseCart(user: User) {
    const cart = await this.cartRepository.findOne({
      where: { user: { id: user.id }, status: CartStatus.ACTIVE },
    });
    if (cart) {
      cart.status = CartStatus.PAUSED;
      await this.cartRepository.save(cart);
    }
  }

  async checkout(user: User, options: { paymentMethod: PaymentMethod, deliveryMethod?: DeliveryMethod, receiptUrl?: string }) {
    const cart = await this.cartRepository.findOne({
      where: { user: { id: user.id }, status: CartStatus.ACTIVE },
      relations: ['items', 'items.productVariant'],
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('El carrito está vacío');
    }

    for (const item of cart.items) {
      const variant = await this.variantRepository.findOne({ 
        where: { id: item.productVariant.id },
        relations: ['product']
      });
      if (!variant || variant.stock < item.quantity) {
        throw new BadRequestException(`Stock insuficiente para ${item.productVariant.sku}`);
      }
      variant.stock -= item.quantity;
      await this.variantRepository.save(variant);

      if (variant.product) {
        variant.product.stock -= item.quantity;
        await this.variantRepository.manager.save(Product, variant.product);
      }
    }

    cart.paymentMethod = options.paymentMethod;
    cart.deliveryMethod = options.deliveryMethod || DeliveryMethod.PICKUP;
    cart.receiptUrl = options.receiptUrl || null;

    //estados según pago
    if (options.paymentMethod === PaymentMethod.TRANSFER) {
      cart.status = CartStatus.PENDING_APPROVAL;
    } else if (options.paymentMethod === PaymentMethod.CASH) {
      cart.status = CartStatus.READY_TO_PICK;
    }

    await this.cartRepository.save(cart);
    return cart;
  }

  //gestión de pedidos
  async findAllOrders() {
    return this.cartRepository.find({
      where: [
        { status: CartStatus.PENDING_APPROVAL },
        { status: CartStatus.READY_TO_PICK },
        { status: CartStatus.COMPLETED },
      ],
      relations: ['user', 'items', 'items.productVariant'],
      order: { updatedAt: 'DESC' }
    });
  }

  async approveOrder(id: number) {
    const cart = await this.cartRepository.findOne({ where: { id } });
    if (!cart) throw new NotFoundException('Pedido no encontrado');

    if (![CartStatus.PENDING_APPROVAL, CartStatus.READY_TO_PICK].includes(cart.status)) {
      throw new BadRequestException('Este pedido no puede ser aprobado en su estado actual');
    }

    cart.status = CartStatus.COMPLETED;
    await this.cartRepository.save(cart);
    return cart;
  }

  async rejectOrder(id: number) {
    const cart = await this.cartRepository.findOne({ where: { id }, relations: ['items', 'items.productVariant'] });
    if (!cart) throw new NotFoundException('Pedido no encontrado');

    for (const item of cart.items) {
      const variant = await this.variantRepository.findOne({ 
        where: { id: item.productVariant.id }, 
        relations: ['product'] 
      });
      if (variant) {
        variant.stock += item.quantity;
        await this.variantRepository.save(variant);

        if (variant.product) {
          variant.product.stock += item.quantity;
          await this.variantRepository.manager.save(Product, variant.product);
        }
      }
    }

    cart.status = CartStatus.CANCELLED;
    await this.cartRepository.save(cart);
    return cart;
  }

  async updateAiAnalysis(id: number, analysis: any) {
    const cart = await this.cartRepository.findOne({ where: { id } });
    if (!cart) throw new NotFoundException('Carrito no encontrado');

    // Bloquear si el carrito ya no está pendiente
    if ([CartStatus.READY_TO_PICK, CartStatus.COMPLETED, CartStatus.CANCELLED].includes(cart.status)) {
      throw new BadRequestException('Este carrito ya fue procesado y no admite más comprobantes.');
    }

    cart.aiAnalysis = analysis;

    // Auto-Aprobación Inteligente mediante IA
    if (analysis && analysis.amount && Number(analysis.amount) >= Number(cart.totalAmount)) {
      cart.status = CartStatus.READY_TO_PICK;
    }

    await this.cartRepository.save(cart);
    return cart;
  }

  private calculateTotal(cart: Cart) {
    cart.totalAmount = cart.items.reduce((acc, item) => {
      return acc + (Number(item.unitPrice) * item.quantity);
    }, 0);
  }

  async removeItem(user: User, itemId: number) {
    const cart = await this.findOrCreateCart(user);
    cart.items = cart.items.filter(item => item.id !== itemId);
    this.calculateTotal(cart);
    await this.cartRepository.save(cart);
    return cart;
  }
}
