import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    }
  }

  async analyzeReceipt(fileBuffer: Buffer, mimeType: string) {
    if (!this.model) {
      throw new InternalServerErrorException('GEMINI_API_KEY no configurada. Por favor, añádela a tu archivo .env.');
    }

    const prompt = `
      Analiza la siguiente captura de pantalla de un comprobante de transferencia bancaria. 
      Extrae los siguientes datos y devuélvelos exclusivamente en formato JSON estructurado:
      - date: Fecha de la transferencia (en formato YYYY-MM-DD si es visible).
      - amount: Monto total transferido (como número, sin símbolos de moneda).
      - originBank: Nombre del banco de origen.
      - targetBank: Nombre del banco de destino.
      - reference: Número de comprobante o referencia de la transferencia.

      Responde únicamente el objeto JSON sin texto adicional ni bloques de código Markdown.
    `;

    try {
      const result = await this.model.generateContent([
        prompt,
        {
          inlineData: {
            data: fileBuffer.toString('base64'),
            mimeType: mimeType,
          },
        },
      ]);

      const responseText = result.response.text();
      const cleanJson = responseText.replace(/```json|```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (error) {
      console.error('Error procesando comprobante con Gemini:', error);
      throw new InternalServerErrorException(`Error al analizar el comprobante con IA. Detalle: ${error.message}`);
    }
  }
}
