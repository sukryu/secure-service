import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'secure-service',
            brokers: ['kafka:9092'],
          },
          consumer: {
            groupId: 'ecommerce-group'
          }
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class kafkaModule {}