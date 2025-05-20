// src/oauth/oauth.service.ts
import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import * as OAuth from 'oauth-1.0a';
import * as crypto from 'crypto';

@Injectable()
export class OAuthService {
  private readonly axiosInstance: AxiosInstance;
  private readonly oauth: OAuth;

  constructor() {
    // Crear la instancia de OAuth
    this.oauth = new OAuth({
      consumer: {
        key: process.env.OAUTH_CONSUMER_KEY,
        secret: process.env.OAUTH_CONSUMER_SECRET,
      },
      signature_method: 'HMAC-SHA256',
      hash_function(baseString, key) {
        return crypto
          .createHmac('sha256', key)
          .update(baseString)
          .digest('base64');
      },
    });

    // Crear la instancia de Axios
    this.axiosInstance = axios.create();
  }

  // Método para generar encabezados OAuth
  private getAuthHeaders(url: string, method: string) {
  const token = {
    key: process.env.OAUTH_TOKEN_KEY,
    secret: process.env.OAUTH_TOKEN_SECRET,
  };

  const requestData = { url, method };

  // Generar encabezados OAuth
const oauthHeader = this.oauth.toHeader(
    this.oauth.authorize(requestData, token),
  ).Authorization; // es un string que comienza con 'OAuth '

  // Construir el header con realm (sin repetir "OAuth " dos veces)
  const authHeader = `OAuth realm="${process.env.OAUTH_REALM}", ` + oauthHeader.slice('OAuth '.length);


  return {
    Authorization: authHeader,
    Prefer: 'transient',
        'Content-Type': 'application/json', 

  };
}


  // Método para realizar solicitudes autenticadas
  async request(url: string, method: string = 'GET', data?: any) {
    try {
      const headers = this.getAuthHeaders(url, method);
      const response = await this.axiosInstance.request({
        url,
        method,
        headers,
        data,
      });
      return response.data;
    } catch (error) {
      console.error('Error en la solicitud:', error.message);
      throw new Error('Error al realizar la solicitud OAuth');
    }
  }
}
