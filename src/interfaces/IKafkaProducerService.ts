import { KafkaMessage } from './../types/KafkaMessage';

export interface IKafkaProducerService {
    sendMessageToTopic(messagePayload: KafkaMessage): Promise<any>;
}
