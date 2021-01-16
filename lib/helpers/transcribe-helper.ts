import * as AWS from 'aws-sdk';
import { StartTranscriptionJobRequest } from 'aws-sdk/clients/transcribeservice';

export class TranscribeHelper {
    transcribe: AWS.TranscribeService;

    constructor() {
        this.transcribe = new AWS.TranscribeService();
    }

    startJob(params: StartTranscriptionJobRequest) {
        return this.transcribe.startTranscriptionJob(params).promise();
    }
}