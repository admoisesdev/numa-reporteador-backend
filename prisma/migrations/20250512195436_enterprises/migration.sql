-- CreateTable
CREATE TABLE "empresas" (
    "id" SERIAL NOT NULL,
    "ruc" DECIMAL(20,0) NOT NULL,
    "razon_social" VARCHAR(255) NOT NULL,
    "proyecto" VARCHAR(255),
    "comercial" VARCHAR(255),
    "establecimiento" VARCHAR(20),
    "representante_legal" VARCHAR(255),
    "fecha" DATE,
    "estado" BOOLEAN DEFAULT true,

    CONSTRAINT "empresas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario_empresa" (
    "usuario_id" TEXT NOT NULL,
    "empresa_id" INTEGER NOT NULL,

    CONSTRAINT "usuario_empresa_pkey" PRIMARY KEY ("usuario_id","empresa_id")
);

-- AddForeignKey
ALTER TABLE "usuario_empresa" ADD CONSTRAINT "usuario_empresa_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "usuario_empresa" ADD CONSTRAINT "usuario_empresa_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
