import {BindingScope, config, inject, injectable} from '@loopback/core';
import assert from 'assert';
import debugFactory from 'debug';
import {SentMessageInfo, Transporter, createTransport} from 'nodemailer';
import previewEmail from 'preview-email';
import {MailerBindings} from '../keys';
import {
  MailerOptions,
  MailerSendMailOptions,
  MailerTransportOptions,
  TemplateAdapter,
} from '../types';

export const debug = debugFactory('loopback:mailer:service');

@injectable({scope: BindingScope.SINGLETON})
export class MailerService {
  transporters = new Map<string, Transporter>();

  constructor(
    @config({fromBinding: MailerBindings.CONFIG})
    readonly mailerOptions: MailerOptions,
    @inject(MailerBindings.TEMPLATE_ADAPTER, {optional: true})
    private templateAdapter: TemplateAdapter,
  ) {
    const transports = mailerOptions?.transports ?? [];
    if (mailerOptions?.transport) {
      transports.push(mailerOptions.transport);
    }

    if (transports.length === 0) {
      throw new Error(
        'Make sure to provide a nodemailer transport configuration object, connection url or a transport plugin instance.',
      );
    }

    transports.forEach(transport => this.setupTransport(transport));
  }

  setupTransport(options: MailerTransportOptions): void {
    const {name, defaults, transport} = options;
    const transporter = createTransport(transport, defaults);
    this.transporters.set(name, transporter);
    this.initTemplatePreview(transporter);
    this.initTemplateAdapter(transporter);
  }

  initTemplateAdapter(transporter: Transporter): void {
    if (this.templateAdapter) {
      transporter.use('compile', (mail, callback) => {
        if (mail.data.html) {
          return callback();
        }
        return this.templateAdapter.compile(mail, callback);
      });
    }
  }

  initTemplatePreview(transporter: Transporter): void {
    if (this.mailerOptions.preview) {
      transporter.use('stream', (mail, callback) => {
        previewEmail(mail.data, this.mailerOptions.preview)
          .then(() => callback())
          .catch(callback);
      });
    }
  }

  async sendMail(mailOptions: MailerSendMailOptions): Promise<SentMessageInfo> {
    const transport = this.transportForName(mailOptions.transport ?? 'default');

    if (!transport) {
      throw Error(`Transport ${transport} not found!`);
    }

    if (debug.enabled) {
      console.log('Sending Mail:');
      if (mailOptions.transport) {
        console.log('\t TRANSPORT:', mailOptions.transport);
      }
      console.log('\t TO:', mailOptions.to);
      console.log('\t FROM:', mailOptions.from);
      console.log('\t SUBJECT:', mailOptions.subject);
      console.log('\t TEXT:', mailOptions.text);
      console.log('\t HTML:', mailOptions.html);
    }

    assert(
      transport.sendMail,
      'You must supply a valid transport that implement sendMail',
    );
    return transport.sendMail(mailOptions);
  }

  transportForName(name: string): Transporter | undefined {
    return this.transporters.get(name);
  }
}
