import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ClientKafka } from "@nestjs/microservices";
import { EventPayloads, eventTypes } from "../interface/event-type.interface";

@Injectable()
export class TypedEventEmitter implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly kafkaClient: ClientKafka) {}

  async onModuleInit() {
    eventTypes.forEach((eventType) => {
      this.kafkaClient.subscribeToResponseOf(eventType);
    });
    await this.kafkaClient.connect();
  }

  async onModuleDestroy() {
    await this.kafkaClient.close();
  }

  async emit<K extends keyof EventPayloads>(
    event: K,
    payload: EventPayloads[K],
  ): Promise<void> {
    this.kafkaClient.emit(event, payload);
  }
}