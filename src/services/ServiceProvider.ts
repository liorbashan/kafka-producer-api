import { WebSocketServer } from './WebSocketServer';
import { KafkaConsumerService } from './KafkaConsumerService';
import { IKafkaConsumerService } from './../interfaces/IKafkaConsumerService';
import { KafkaProducerService } from './KafkaProducerService';
import { IKafkaProducerService } from '../interfaces/IKafkaProducerService';
import Container from 'typedi';

export async function createServiceContainers(): Promise<void> {
    // KafkaProducer:
    const kafkaProducerService: IKafkaProducerService = new KafkaProducerService();
    Container.set('KafkaProducerService', kafkaProducerService);

    // KafkaConsumer:
    const wss: WebSocketServer = new WebSocketServer(6969);
    const kafkaConsumerService: IKafkaConsumerService = new KafkaConsumerService(wss);
    Container.set('KafkaConsumerService', kafkaConsumerService);
}
