import { WebSocketServer } from './WebSocketServer';
import { KafkaConsumerService } from './KafkaConsumerService';
import { IKafkaConsumerService } from './../interfaces/IKafkaConsumerService';
import { KafkaProducerService } from './KafkaProducerService';
import { IKafkaProducerService } from '../interfaces/IKafkaProducerService';
import Container from 'typedi';

export async function createServiceContainers(): Promise<void> {
    // WebSocket Server:
    const wss: WebSocketServer = new WebSocketServer(6969);
    Container.set('WebSocketServer', wss);

    // KafkaProducer:
    const kafkaProducerService: IKafkaProducerService = new KafkaProducerService();
    Container.set('KafkaProducerService', kafkaProducerService);

    // KafkaConsumer:
    const kafkaConsumerService: IKafkaConsumerService = new KafkaConsumerService();
    Container.set('KafkaConsumerService', kafkaConsumerService);
}
