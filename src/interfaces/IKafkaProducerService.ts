import { KafkaMessage, KafkaCreateTopicRequest } from './../types/KafkaMessage';

export interface IKafkaProducerService {
    sendMessageToTopic(messagePayload: KafkaMessage): Promise<any>;
    createTopic(data: KafkaCreateTopicRequest[]): Promise<any>;
}
