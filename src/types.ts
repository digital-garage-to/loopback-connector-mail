import {SendMailOptions, TransportOptions} from 'nodemailer';
import JSONTransport from 'nodemailer/lib/json-transport';
import MailMessage from 'nodemailer/lib/mailer/mail-message';
import SendmailTransport from 'nodemailer/lib/sendmail-transport';
import SESTransport from 'nodemailer/lib/ses-transport';
import SMTPPool from 'nodemailer/lib/smtp-pool';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import StreamTransport from 'nodemailer/lib/stream-transport';
import previewEmail from 'preview-email';

export type MailerSendMailOptions = SendMailOptions & {
  transport?: string;
  template: string;
  context?: {[name: string]: unknown};
};

type Options =
  | SMTPTransport.Options
  | SMTPPool.Options
  | SendmailTransport.Options
  | StreamTransport.Options
  | JSONTransport.Options
  | SESTransport.Options
  | TransportOptions;

export type TransportType =
  | Options
  | SMTPTransport
  | SMTPPool
  | SendmailTransport
  | StreamTransport
  | JSONTransport
  | SESTransport
  | TransportOptions
  | string;

export interface MailerTransportOptions {
  name: string;
  transport: TransportType;
  defaults?: Options;
}

export interface TemplateAdapterConfig {
  dir: string;
  options?: {[name: string]: unknown};
}

export interface TemplateAdapter {
  compile(
    mail: MailMessage,
    callback: (err?: Error | null | undefined) => void,
  ): void;
}

export interface MailerOptions {
  transport?: MailerTransportOptions;
  transports?: MailerTransportOptions[];
  template?: TemplateAdapterConfig;
  preview?: previewEmail.Options;
}
