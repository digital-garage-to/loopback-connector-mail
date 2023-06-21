/** Dependencies **/
import {Provider, config} from '@loopback/core';
import {TemplateDelegate, compile} from 'handlebars';
import fs from 'node:fs/promises';
import MailMessage from 'nodemailer/lib/mailer/mail-message';
import * as path from 'path';
import {MailerBindings} from '../keys';
import {
  MailerOptions,
  MailerSendMailOptions,
  TemplateAdapter,
  TemplateAdapterConfig,
} from '../types';

export class HandlebarsAdapterProvider implements Provider<HandlebarsAdapter> {
  constructor(
    @config({fromBinding: MailerBindings.CONFIG})
    readonly mailerOptions: MailerOptions,
  ) {}

  value(): HandlebarsAdapter {
    const {template} = this.mailerOptions;
    if (!template) {
      throw Error('template configuration must be defined');
    }
    return new HandlebarsAdapter(template);
  }
}

class HandlebarsAdapter implements TemplateAdapter {
  private templates = new Map<string, TemplateDelegate>();

  constructor(private options: TemplateAdapterConfig) {}
  public async compile(
    mail: MailMessage,
    callback: (err?: Error | null | undefined) => void,
  ): Promise<void> {
    const {template, context} = mail.data as MailerSendMailOptions;

    const {dir, options} = this.options;
    const compileOptions = options?.compileOptions ?? {};
    const runtimeOptions = options?.runtimeOptions ?? {};
    const templateName = `${template}.hbs`;
    const templatePath = path.join(dir, templateName);

    let compiledTemplate = this.templates.get(template);

    if (!compiledTemplate) {
      try {
        const t = await fs.readFile(templatePath, 'utf-8');
        compiledTemplate = compile(t, compileOptions);
        this.templates.set(template, compiledTemplate);
      } catch (err) {
        return callback(err);
      }
    }

    mail.data.html = compiledTemplate(context, runtimeOptions);

    callback();
  }
}
