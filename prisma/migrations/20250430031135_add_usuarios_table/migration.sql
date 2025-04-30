-- CreateTable
CREATE TABLE "clientes" (
    "id" SERIAL NOT NULL,
    "identificacion" VARCHAR(20) NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "proyecto" VARCHAR(100),
    "telefono" VARCHAR(20),
    "email" VARCHAR(255),
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cobros" (
    "id" SERIAL NOT NULL,
    "id_contrato" VARCHAR(50),
    "valor_cobrado" DECIMAL(15,2),
    "num_dividendo" INTEGER,
    "tipo_dividendo" VARCHAR(50),
    "tipo_transaccion" VARCHAR(50),
    "fecha_cobro" DATE,
    "fecha_vcto_cobro" DATE,
    "concepto" VARCHAR(255),
    "tipo_comprobante" VARCHAR(50),
    "id_transaccion" INTEGER,
    "referencia" VARCHAR(50),
    "nro_documento" VARCHAR(50),
    "cuenta_plan" VARCHAR(50),
    "nombre_cuenta" VARCHAR(100),
    "recibo_num" VARCHAR(50),
    "cabecera_id" INTEGER,

    CONSTRAINT "cobros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contratos" (
    "id" VARCHAR(50) NOT NULL,
    "estado" VARCHAR(20),
    "ubicacion" VARCHAR(100),
    "cliente_id" INTEGER,
    "cliente_vendedor" VARCHAR(100),
    "fecha_creacion" DATE,
    "empresa" VARCHAR(100),
    "proyecto" VARCHAR(100),
    "precio_lista" DECIMAL(15,2),
    "descuento" DECIMAL(15,2),
    "precioventa" DECIMAL(15,2),
    "fecha_reserva" DATE,
    "fecha_cierre" DATE,
    "financiamiento_idvigente" INTEGER,
    "tipo_contratoid" VARCHAR(50),
    "valor_contrato" DECIMAL(15,2),
    "valor_reserva" DECIMAL(15,2),
    "cuota_reserv2" DECIMAL(15,2),
    "cuota_reserv8" DECIMAL(15,2),
    "valor_saldo" DECIMAL(15,2),
    "plazo_ce" INTEGER,
    "cantidad_cuota_inicial" DECIMAL(5,2),
    "tipo_producto" VARCHAR(50),
    "valor_por_vencer" DECIMAL(15,2),
    "porcentaje_cobrado" DECIMAL(15,2),
    "valor_documentos_vencidos" DECIMAL(15,2),
    "asesor_credito" VARCHAR(100),
    "moneda" VARCHAR(10),
    "int_mora_pagar" DECIMAL(15,2),
    "valor_total_vencido" DECIMAL(15,2),
    "valor_nc" DECIMAL(15,2),
    "valor_total_descuento" DECIMAL(15,2),
    "saldo_ce" DECIMAL(15,2),
    "valor_canc_mora" DECIMAL(15,2),
    "valor_canc_pago_exced" DECIMAL(15,2),
    "valor_neto_cancel" DECIMAL(15,2),
    "valor_canc_cheq" DECIMAL(15,2),
    "valor_total_cob_client" DECIMAL(15,2),

    CONSTRAINT "contratos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financiamiento" (
    "id" SERIAL NOT NULL,
    "id_contrato" VARCHAR(50),
    "cabecera_id" INTEGER,
    "cabecera_factura" INTEGER,
    "estado" VARCHAR(20),
    "numero_dividendo" INTEGER,
    "tipo_dividendo" VARCHAR(50),
    "valor_dividendos" DECIMAL(15,2),
    "valor_mora" DECIMAL(15,2),
    "fecha_refinanciamiento" DATE,
    "total_dividendo" INTEGER,
    "fecha_creacion" DATE,
    "fecha_vencimiento" DATE,
    "estado_dividendo" VARCHAR(20),
    "valor_interes_div" DECIMAL(15,2),
    "mostrar_reporte" BOOLEAN,
    "valor_pagado_div" DECIMAL(15,2),
    "fecha_pago_div" DATE,

    CONSTRAINT "financiamiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "apellido" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "roles" TEXT[] DEFAULT ARRAY['user']::TEXT[],

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- AddForeignKey
ALTER TABLE "cobros" ADD CONSTRAINT "cobros_id_contrato_contratos_id_fk" FOREIGN KEY ("id_contrato") REFERENCES "contratos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "contratos" ADD CONSTRAINT "contratos_cliente_id_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "financiamiento" ADD CONSTRAINT "financiamiento_id_contrato_contratos_id_fk" FOREIGN KEY ("id_contrato") REFERENCES "contratos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
