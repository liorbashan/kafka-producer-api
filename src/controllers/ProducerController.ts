import { IKafkaProducerService } from './../interfaces/IKafkaProducerService';
import { Container } from 'typedi';
import { KafkaMessage } from './../types/KafkaMessage';
import { JsonController, Post, Body, BadRequestError } from 'routing-controllers';

@JsonController('/api')
export class ProducerController {
    constructor(private _kafkaProducer: IKafkaProducerService) {
        if (!this._kafkaProducer) {
            this._kafkaProducer = Container.get('KafkaService');
        }
    }

    @Post('/produce-message')
    public async produce(@Body() payload: KafkaMessage): Promise<any> {
        const validRequest: KafkaMessage = this.validateRequest(payload);
        const response: any = await this._kafkaProducer.sendMessageToTopic(validRequest);
        return response ? response : 'Error in parsing response';
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
