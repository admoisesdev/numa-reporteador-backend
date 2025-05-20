import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import dayjs from 'dayjs';

import { PrismaService } from 'src/common';
import { OAuthService } from 'src/oauth/oauth.service';

interface UpdateContractsUseCase {
  execute(): Promise<string>;
}

@Injectable()
export class UpdateContracts implements UpdateContractsUseCase {
  private readonly logger = new Logger('UpdateContracts');

  constructor(
    private prisma: PrismaService,
    private readonly oauthService: OAuthService,
  ) {}

  private handleExceptions(error: any) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }

  

  async execute(): Promise<any> {
    const url =
      'https://9645145-sb1.suitetalk.api.netsuite.com/services/rest/query/v1/suiteql';

        const fetchDate = dayjs().subtract(2, 'day').format('DD/MM/YYYY');

    const contractsQuery = {
      q: `"SELECT DISTINCT a.custbody_syw_09_items_reference from transaction a where a.trandate > '${fetchDate}'`,
    };

    const contractsData = await this.oauthService.request(
      url,
      'POST',
      contractsQuery,
    );

    const contracts = contractsData.items
      .map((item) => item.custbody_syw_09_items_reference)
      .filter(Boolean);

    this.logger.log(contracts);

    for (let contract of contracts) {
      let existsContract = await this.prisma.contratos.findFirst({
        where: {
          id: contract,
        },
      });
      if (existsContract) {
        this.logger.error('Contract with id: ' + contract + ' already exists.');
        continue;
      }
      const clientQuery = {
        q: `SELECT c.entity as code_Cliente, a.trandate as fecha_Transaccion, e.altname as nomnre_Cliente, e.email as email, e.phone as phone, c.transaction as id_Cuota, e.custentity_syw_04_id_fiscal as id_Fiscal, d.accountsearchdisplayname cuenta_nombre, a.custbody_syw_conceptocuota as concepto_cuota, c.netamount as Importe_de_la_Cuota FROM transaction a LEFT JOIN transactionLine c ON a.id = c.transaction JOIN account d ON d.id = c.expenseaccount JOIN customer e ON e.id = c.entity WHERE accountinglinetype = 'ACCOUNTSRECEIVABLE' AND a.custbody_syw_09_items_reference = '${contract}'`,
      };


      const clientData = await this.oauthService.request(
        url,
        'POST',
        clientQuery,
      );


      if (clientData.items.length === 0) {
        this.logger.error('Client info not exists for: ' + contract);
        continue;
      }

      const clientInfo = clientData.items[0];

      let client = await this.prisma.clientes.findFirst({
        where: {
          identificacion: clientInfo.id_fiscal,
        },
      });

      if (!client) {
        this.logger.log('Saving client ' + clientInfo.nomnre_cliente);
        const ultimoCliente = await this.prisma.clientes.findFirst({
          orderBy: {
            id: 'desc',
          },
        });
        client = await this.prisma.clientes.create({
          data: {
            id: ultimoCliente.id + 1,
            identificacion: clientInfo.id_fiscal,
            nombre: clientInfo.nomnre_cliente,
            proyecto: 'NUMA',
            email: clientInfo.email,
            telefono: clientInfo.phone,
            activo: true,
          },
        });
      }

      const rawDate = clientInfo.fecha_transaccion;

      const [day, month, year] = rawDate.split('/');

      // Aseguramos que tengan dos dígitos
      const normalizedDay = day.padStart(2, '0');
      const normalizedMonth = month.padStart(2, '0');

      const isoDateStr = `${year}-${normalizedMonth}-${normalizedDay}`; // "2025-05-19"

      const fecha = new Date(isoDateStr);

      const savedContract = await this.prisma.contratos.create({
        data: {
          id: contract,
          estado: 'Activo',
          ubicacion: null,
          cliente_id: client.id,
          cliente_vendedor: null,
          fecha_creacion: fecha,
          empresa: 'NUMA S.A.S.',
          proyecto: 'NUMA',
          precio_lista: null,
          descuento: null,
          precioventa: null,
          fecha_reserva: null,
          fecha_cierre: null,
          financiamiento_idvigente: 1,
          tipo_contratoid: null,
          valor_contrato: null,
          valor_reserva: null,
          cuota_reserv2: null,
          cuota_reserv8: null,
          valor_saldo: null,
          plazo_ce: null,
          cantidad_cuota_inicial: null,
          tipo_producto: null,
          valor_por_vencer: null,
          porcentaje_cobrado: null,
          valor_documentos_vencidos: null,
          asesor_credito: null,
          moneda: null,
          int_mora_pagar: null,
          valor_total_vencido: null,
          valor_nc: null,
          valor_total_descuento: null,
          saldo_ce: null,
          valor_canc_mora: null,
          valor_canc_pago_exced: null,
          valor_neto_cancel: null,
          valor_canc_cheq: null,
          valor_total_cob_client: null,
        },
      });

      for (let cuota of clientData.items) {
        const rawDate = cuota.fecha_transaccion;

        const [day, month, year] = rawDate.split('/');

        // Aseguramos que tengan dos dígitos
        const normalizedDay = day.padStart(2, '0');
        const normalizedMonth = month.padStart(2, '0');

        const isoDateStr = `${year}-${normalizedMonth}-${normalizedDay}`; // "2025-05-19"
        

        const fecha = new Date(isoDateStr);

        const ultimaCuota = await this.prisma.financiamiento.findFirst({
          orderBy: {
            id: 'desc',
          },
        });
        await this.prisma.financiamiento.create({
          data: {
            id: ultimaCuota.id + 1,
            id_contrato: contract,
            estado: 'Activo',
            numero_dividendo: null,
            tipo_dividendo: cuota.concepto_cuota,
            valor_dividendos: cuota.importe_de_la_cuota,
            fecha_creacion: fecha,
            fecha_vencimiento: null,
          },
        });
      }
    }
  }
}
