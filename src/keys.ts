import {BindingKey, CoreBindings} from '@loopback/core';
import {MailerComponent} from './component';
import {MailerOptions, TemplateAdapter} from './types';

export const MAILER_EXTENSION = 'mailer.extension';
/**
 * Binding keys used by this component.
 */
export namespace MailerBindings {
  export const COMPONENT = BindingKey.create<MailerComponent>(
    `${CoreBindings.COMPONENTS}.MailerComponent`,
  );

  export const CONFIG = BindingKey.create<MailerOptions>('mailer.config');

  export const TEMPLATE_ADAPTER = BindingKey.create<TemplateAdapter>(
    'mailer.template-adapter',
  );
}
