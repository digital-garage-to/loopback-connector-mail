/** Dependencies **/
import {Provider, config} from '@loopback/core';
import MailMessage from 'nodemailer/lib/mailer/mail-message';
import * as path from 'path';
import {renderFile} from 'pug';
import {MailerBindings} from '../keys';
import {
  MailerOptions,
  MailerSendMailOptions,
  TemplateAdapter,
  TemplateAdapterConfig,
} from '../types';

export class PugAdapterProvider implements Provider<PugAdapter> {
  constructor(
    @config({fromBinding: MailerBindings.CONFIG})
    readonly mailerOptions: MailerOptions,
  ) {}

  value(): PugAdapter {
    const {template} = this.mailerOptions;
    if (!template) {
      throw Error('template configuration must be defined');
    }
    return new PugAdapter(template);
  }
}

class PugAdapter implements TemplateAdapter {
  constructor(private options: TemplateAdapterConfig) {}
  public compile(
    mail: MailMessage,
    callback: (err?: Error | null | undefined) => void,
  ): void {
    const {template, context} = mail.data as MailerSendMailOptions;

    const {dir, options} = this.options;
    const templateName = `${template}.pug`;
    const templatePath = path.join(dir, templateName);

    const pugOptions = {
      ...context,
      ...options,
    };

    renderFile(templatePath, pugOptions, (err, body) => {
      if (err) {
        return callback(err);
      }

      mail.data.html = body;
      return callback();
    });
  }
}
