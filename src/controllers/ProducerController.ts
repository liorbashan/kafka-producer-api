import { IKafkaProducerService } from './../interfaces/IKafkaProducerService';
import { Container } from 'typedi';
import { KafkaMessage, KafkaResponse, KafkaCreateTopicRequest } from './../types/KafkaMessage';
import { JsonController, Post, Body, BadRequestError } from 'routing-controllers';

@JsonController('/api')
export class ProducerController {
    constructor(private _kafkaProducer: IKafkaProducerService) {
        if (!this._kafkaProducer) {
            this._kafkaProducer = Container.get('KafkaProducerService');
        }
    }

    @Post('/produce-message')
    public async produce(@Body() payload: KafkaMessage): Promise<any> {
        const validRequest: KafkaMessage = this.validateRequest(payload);
        const response: KafkaResponse = await this._kafkaProducer.sendMessageToTopic(validRequest);
        return response ? response : 'Error in parsing response';
    }

    @Post('/create-topic')
    public async createTopic(@Body() payload: KafkaCreateTopicRequest[]): Promise<any> {
        const respone: any = await this._kafkaProducer.createTopic(payload).catch((error) => {
            const err: Error = {
                message: error.message || undefined,
                name: error.name || undefined,
                stack: error.stack || undefined,
            };
            throw err;
        });
        return respone;
    }

    private validateRequest(request: KafkaMessage): KafkaMessage {
        if (!request.partition) {
            request.partition = 0;
        }
        if (!request.key) {
            request.key = undefined;
        }
        if (!request.message || request.message.length <= 0) {
            throw new BadRequestError('message length is zero');
        } else {
            const msgArr: string[] = [];
            for (const msg of request.message) {
                msgArr.push(JSON.stringify(msg));
            }
            request.message = msgArr;
        }

        return request;
    }
}
