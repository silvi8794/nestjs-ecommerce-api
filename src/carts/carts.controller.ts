import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  UseGuards,
  Delete,
  Param,
  ParseIntPipe,
  Patch,
  BadRequestException
} from '@nestjs/common';
import { CartsService } from './carts.service';
import { JwtAccessTokenGuard } from '../auth/guards/jwt-access-token/jwt-access-token.guard';
import { RolesGuard } from '../auth/guards/roles/roles.guard';
import { Roles } from '../auth/decorators/roles.decorators';
import { ActiveUser } from '../auth/decorators/active-user.decorator';
import { AddItemDto } from './dto/add-item.dto';
import { CheckoutDto } from './dto/checkout.dto';
import { RoleList } from '../role/entities/constants';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadedFile, UseInterceptors } from '@nestjs/common';
import { AiService } from '../ai/ai.service';

@ApiTags('carts')
@Controller('carts')
@UseGuards(JwtAccessTokenGuard)
@ApiBearerAuth()
export class CartsController {
  constructor(
    private readonly cartsService: CartsService,
    private readonly aiService: AiService
  ) {}

  @Post('add')
  @ApiOperation({ summary: 'Add an item to the cart' })
  addItem(@ActiveUser() user, @Body() addItemDto: AddItemDto) {
    return this.cartsService.addItem(user, addItemDto.variantId, addItemDto.quantity);
  }

  @Get('current')
  @ApiOperation({ summary: 'Get current user cart' })
  getCurrentCart(@ActiveUser() user) {
    return this.cartsService.findOrCreateCart(user);
  }

  @Post('pause')
  @ApiOperation({ summary: 'Pause the current cart' })
  pauseCart(@ActiveUser() user) {
    return this.cartsService.pauseCart(user);
  }

  @Post('checkout')
  @ApiOperation({ summary: 'Proceed to checkout with payment and delivery details' })
  checkout(@ActiveUser() user, @Body() checkoutDto: CheckoutDto) {
    return this.cartsService.checkout(user, {
      paymentMethod: checkoutDto.paymentMethod,
      deliveryMethod: checkoutDto.deliveryMethod,
      receiptUrl: checkoutDto.receiptUrl
    });
  }

  @Delete('item/:id')
  @ApiOperation({ summary: 'Remove an item from the cart' })
  removeItem(@ActiveUser() user, @Param('id', ParseIntPipe) itemId: number) {
    return this.cartsService.removeItem(user, itemId);
  }

  @Post('upload-receipt/:id')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a manual transfer receipt and analyze it with AI' })
  @ApiBody({
      schema: {
          type: 'object',
          properties: {
              file: {
                  type: 'string',
                  format: 'binary',
              },
          },
      },
  })
  async uploadReceipt(
    @ActiveUser() user,
    @Param('id', ParseIntPipe) cartId: number,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException('Debe adjuntar una imagen del comprobante válido');
    }

    const analysis = await this.aiService.analyzeReceipt(file.buffer, file.mimetype);
    await this.cartsService.updateAiAnalysis(cartId, analysis, user.id);
    
    return {
      message: 'Comprobante analizado y guardado con éxito',
      detectedData: analysis
    };
  }

  // --- Endpoints Administrativos ---

  @Get('admin/orders')
  @UseGuards(RolesGuard)
  @Roles(RoleList.ADMIN)
  @ApiOperation({ summary: 'Get all pending orders (Admin only)' })
  findAllOrders() {
    return this.cartsService.findAllOrders();
  }

  @Patch('admin/approve/:id')
  @UseGuards(RolesGuard)
  @Roles(RoleList.ADMIN)
  @ApiOperation({ summary: 'Approve a payment/pickup (Admin only)' })
  approveOrder(@Param('id', ParseIntPipe) id: number) {
    return this.cartsService.approveOrder(id);
  }

  @Patch('admin/reject/:id')
  @UseGuards(RolesGuard)
  @Roles(RoleList.ADMIN)
  @ApiOperation({ summary: 'Reject a payment/order and return stock (Admin only)' })
  rejectOrder(@Param('id', ParseIntPipe) id: number) {
    return this.cartsService.rejectOrder(id);
  }
}
