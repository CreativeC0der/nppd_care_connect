import { Injectable } from '@nestjs/common';
import * as Brevo from '@getbrevo/brevo';
import * as fs from 'fs';

@Injectable()
export class MailerService {

    async sendMail(data: { mailData: any; template: string; attachments?: any[] }): Promise<boolean> {
        try {
            const apiKey = process.env.BREVO_API_KEY;
            new Brevo.SendSms()
            const apiInstance = new Brevo.TransactionalEmailsApi()
            apiInstance.setApiKey(0, apiKey!)

            let { mailData, template, attachments } = data
            let { receivers, subject, params, sender } = mailData
            const emailTemplateSource = fs.readFileSync(`src/Utils/mailer/templates/${template}.html`, 'utf8')

            // If email is null or undefined, set it to the default receiver email
            receivers = receivers.map((receiver: any) => {
                return {
                    ...receiver,
                    email: receiver.email ?? process.env.RECEIVER_EMAIL,
                }
            });

            await apiInstance.sendTransacEmail({
                sender: sender,
                to: receivers,
                subject: subject,
                htmlContent: `${emailTemplateSource}`,
                params: {
                    ...params
                },
                attachment: attachments && attachments.length > 0 ? attachments : null!
            })

            return true
        } catch (error) {
            console.log('ERROR SENDING EMAIL: ', error)
            return false
        }
    }
}

