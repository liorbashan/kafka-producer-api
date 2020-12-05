import { WebSocketServer } from './WebSocketServer';
import { KafkaCreateTopicRequest } from './../types/KafkaMessage';
import { IKafkaProducerService } from './../interfaces/IKafkaProducerService';
import { IKafkaConsumerService } from '../interfaces/IKafkaConsumerService';
import { KafkaConfig } from '../types/KafkaConfig';
import { Service, Container } from 'typedi';
import kafka, { Consumer, ConsumerOptions, KafkaClient, OffsetFetchRequest } from 'kafka-node';
import path from 'path';
import { baseDir } from '../app';

@Service()
export class KafkaConsumerService implements IKafkaConsumerService {
    public _consumer!: kafka.Consumer;
    public _ofr!: OffsetFetchRequest;
    private _consumerConfig!: ConsumerOptions;
    private restart: boolean = false;
    constructor(private _websocket: WebSocketServer) {
        if (!this._websocket) {
            this._websocket = Container.get('WebSocketServer');
        }
        this.initConsumer();
    }

    public startConsuming(): any {
        if (this.restart) {
            this.initConsumer();
            this.restart = false;
        }
        console.log('Consuming Starting');
        this._consumer.on('message', (message) => {
            // process message:
            this._websocket.wss.clients.forEach((c) => {
                const client = c;
                c.send(`kafka message that was consumed: ${message}`);
            });
            // commit offset (if auto commit is off)
            console.log(message);
        });
    }

    private initConsumer(): void {
        const kafkaclient: KafkaClient = this.createKafkaClient();
        const autoCommit: boolean = process.env.CONSUMER_AUTOCOMMIT === 'true' ? true : false;
        // tslint:disable-next-line: radix
        const autoCommitIntervalMs: number = parseInt(process.env.CONSUMER_AUTOCOMMIT_INTERVALS as string) || 1000;
        const groupId: string = (process.env.CONSUMER_GROUP_ID as string) || '';
        // tslint:disable-next-line: radix
        const fetchMaxWaitMs: number = parseInt(process.env.CONSUMER_FETCH_MAX_WAIT as string) || 1000;
        const fromOffset: boolean = process.env.CONSUMER_FROM_OFFSET === 'true' ? true : false;
        const topic = (process.env.CONSUMER_TOPIC_NAME as string) || '';
        // tslint:disable-next-line: radix
        const offset: number = parseInt(process.env.CONSUMER_OFFSET as string) || 0;
        // tslint:disable-next-line: radix
        const partition: number = parseInt(process.env.CONSUMER_PARTITION as string) || 0;

        this._ofr = {
            topic,
            offset,
            partition,
        };

        this._consumerConfig = {
            autoCommit,
            autoCommitIntervalMs,
            groupId,
            fetchMaxWaitMs,
            fetchMinBytes: undefined,
            fetchMaxBytes: undefined,
            fromOffset,
            // encoding?: 'buffer' | 'utf8';
            // keyEncoding?: 'buffer' | 'utf8';
        };

        this._consumer = new Consumer(kafkaclient, [this._ofr], this._consumerConfig);
        this._consumer.on('error', (err: Error) => {
            if (err.name === 'TopicsNotExistError') {
                this._consumer.close(true, () => {
                    console.log('Topic Not Found: closing consumer');
                });
                this.createMisingTopic();
            } else {
                console.log('Consumer Error: ', err);
                throw err;
            }
        });
        this._consumer.on('offsetOutOfRange', (err) => {
            console.log('Consumer offsetOutOfRange: ', err);
        });

        console.log('Consumer Connected');
    }

    private async createMisingTopic(): Promise<any> {
        const producer: IKafkaProducerService = Container.get('KafkaProducerService');
        const topicRequest: KafkaCreateTopicRequest = {
            topic: this._ofr.topic,
            retention: 10,
            messages: `{"initial":"topic created"}`,
        };
        const respone: any = await producer.createTopic([topicRequest]).catch((error) => {
            const err: Error = {
                message: error.message || undefined,
                name: error.name || undefined,
                stack: error.stack || undefined,
            };
            throw err;
        });
        if (respone) {
            this.restart = true;
            this.startConsuming();
        }
    }

    private createKafkaClient(): KafkaClient {
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
        console.log('Consumer Client', config);
        const client = new kafka.KafkaClient(config);
        return client;
    }
}
