import { KafkaProducerService } from './KafkaProducerService';
import { IKafkaProducerService } from '../interfaces/IKafkaProducerService';
import Container from 'typedi';

export async function createServiceContainers(): Promise<void> {
    // KafkaProducer:
    const kafkaService: IKafkaProducerService = new KafkaProducerService();
    Container.set('KafkaService', kafkaService);
}
