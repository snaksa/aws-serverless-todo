import { Polly } from 'aws-sdk';
import { StartSpeechSynthesisTaskInput } from 'aws-sdk/clients/polly';

export class PollyHelper {
    polly: Polly;

    constructor() {
        this.polly = new Polly();
    }

    startJob(params: StartSpeechSynthesisTaskInput) {
        return this.polly.startSpeechSynthesisTask(params).promise();
    }
}