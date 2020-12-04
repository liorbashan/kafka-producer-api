import { KafkaCreateTopicRequest } from './../types/KafkaMessage';
import { IKafkaProducerService } from '../interfaces/IKafkaProducerService';
import { KafkaMessage, KafkaResponse } from '../types/KafkaMessage';
import { KafkaConfig } from '../types/KafkaConfig';
import { Service } from 'typedi';
import kafka, { KafkaClient } from 'kafka-node';
import path from 'path';
import { baseDir } from '../app';

@Service()
export class KafkaProducerService implements IKafkaProducerService {
    public _producer: kafka.Producer;
    constructor() {
        const kafkaclient: KafkaClient = this.createKafkaClient();
        const Producer = kafka.Producer;
        this._producer = new Producer(kafkaclient);
        this._producer.on('ready', async () => {
            console.log('Producer Connected');
        });
        this._producer.on('error', (error) => {
            console.log('Producer Error', error);
            // this._producer.close();
            throw error;
        });
    }

    public async createTopic(data: KafkaCreateTopicRequest[]): Promise<any> {
        return new Promise((res, rej) => {
            this._producer.send(data, (err, data) => {
                console.log('Sending Topic Request...');
                if (err) {
                    console.log(err);
                    rej(err);
                } else {
                    console.log('broker update success');
                    return res(data);
                }
            });
        });
    }

    public async sendMessageToTopic(messagePayload: KafkaMessage): Promise<KafkaResponse> {
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
                    const response: KafkaResponse | null = this.parseKafkaResponse(data);
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

    private parseKafkaResponse(data: any): KafkaResponse {
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
            const res: KafkaResponse = {};
            return res;
        }
    }

    private createKafkaClient(): kafka.KafkaClient {
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
            sslLocation = path.join(baseDir, process.env.KAFKA_SSL_CERT_LOCATION as string);
            config = {
                kafkaHost,
                sslUser,
                sslPass,
                sslLocation,
                sslOptions: {
                    rejectUnauthorized: false,
                },
                sasl: {
                    mechanism: sslMechanism,
                },
            };
            // console.log('Kafka Settings: ', { host: kafkaHost, mechanism: sslMechanism, sslUser, sslPass, sslLocation });
        } else {
            config = {
                kafkaHost,
            };
        }
        console.log('Producer Client', config);
        const client = new kafka.KafkaClient(config);
        return client;
    }
}
