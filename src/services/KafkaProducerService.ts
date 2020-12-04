import { IKafkaProducerService } from '../interfaces/IKafkaProducerService';
import { KafkaMessage, KafkaResponse } from '../types/KafkaMessage';
import { KafkaConfig } from '../types/KafkaConfig';
import { Service } from 'typedi';
import kafka from 'kafka-node';

@Service()
export class KafkaProducerService implements IKafkaProducerService {
    public _kafkaConfig: any;
    public _producer: kafka.Producer;
    constructor() {
        const kafkaHost = process.env.KAFKA_HOST || '';
        const sslMechanism = process.env.KAFKA_SASL_MECHANISM || '';
        const secureConnection = process.env.KAFKA_SECURE_CONNECTION;
        let sslUser = '';
        let sslPass = '';
        let sslLocation = '';
        let config: any | KafkaConfig = null;
        if (secureConnection === 'true') {
            sslUser = process.env.KAFKA_SASL_USER || '';
            sslPass = process.env.KAFKA_SASL_PASSWORD || '';
            // sslLocation = path.join(baseDir, process.env.KAFKA_SSL_CERT_LOCATION as string);
            config = {
                kafkaHost,
            };
            // console.log('Kafka Settings: ', { host: kafkaHost, mechanism: sslMechanism, sslUser, sslPass, sslLocation });
        } else {
            config = {
                kafkaHost,
            };
        }
        console.log('kafka config', config);
        const Producer = kafka.Producer;
        const client = new kafka.KafkaClient(config);
        this._producer = new Producer(client);
        this._producer.on('ready', async () => {
            console.log('Kafka Connection Success');
        });
        this._producer.on('error', (error) => {
            console.log('Kafka Connection Error', error);
            throw error;
        });
    }
    public async sendMessageToTopic(messagePayload: KafkaMessage): Promise<any> {
        const payloads = [
            {
                topic: messagePayload.topicName,
                messages: messagePayload.message,
                key: messagePayload.key,
                partition: messagePayload.partition,
            },
        ];
        return new Promise((res, rej) => {
            this._producer.send(payloads, (err, data) => {
                if (data) {
                    const response = this.parseKafkaResponse(data);
                    return res(response);
                }
                if (err) {
                    console.log(`[kafka-producer -> ${messagePayload.topicName}]: broker update failed`);
                    console.log(err.message);
                    return rej(err);
                }
            });
        });
    }

    private parseKafkaResponse(data: any): any {
        console.log(data);
        try {
            const topicName: string = Object.keys(data)[0];
            const value = data[Object.keys(data)[0]];
            const partition: number = Number(Object.keys(value)[0]);
            const cursorPosition: number = value[Object.keys(value)[0]];
            const parsedResponse: KafkaResponse = {
                topicName,
                partition,
                cursorPosition,
            };
            return parsedResponse;
        } catch (error) {
            return null;
        }
    }
}
