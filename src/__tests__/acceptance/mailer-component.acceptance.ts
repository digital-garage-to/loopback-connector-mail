import {Application} from '@loopback/core';
import {expect} from '@loopback/testlab';
import getStream from 'get-stream';
import path from 'node:path';
import {PugAdapterProvider} from '../../adapters';
import {HandlebarsAdapterProvider} from '../../adapters/handblears.adapter';
import {MailerComponent} from '../../component';
import {MailerBindings} from '../../keys';
import {MailerService} from '../../services/mailer.service';

describe('MailerComponent', () => {
  let app: Application;

  describe('Default configuration', () => {
    beforeEach(givenAppWithDefaultConfig);

    it('throw error without configuration', async () => {
      await expect(app.get(`services.${MailerService.name}`)).to.rejected();
    });

    it('throw error with empty configuration', async () => {
      app.bind(MailerBindings.CONFIG).to({});
      await expect(app.get(`services.${MailerService.name}`)).to.rejected();
    });

    it('get mailer service', async () => {
      app.configure(MailerBindings.CONFIG).to({
        transports: [
          {
            name: 'default',
            transport: {streamTransport: true},
          },
        ],
      });

      const mailService: MailerService = await app.get(
        `services.${MailerService.name}`,
      );
      expect(mailService).to.be.ok();
      expect(mailService.sendMail).to.be.Function();
    });
  });

  describe('Template adapter', () => {
    beforeEach(givenAppWithDefaultConfig);

    it('Pug', async () => {
      app.bind(MailerBindings.TEMPLATE_ADAPTER).toProvider(PugAdapterProvider);
      const config = {
        transports: [
          {
            name: 'default',
            transport: {streamTransport: true},
          },
        ],
        template: {
          dir: path.join(__dirname, '..', '..', '..', 'templates'),
        },
      };
      app.configure(MailerBindings.CONFIG).to(config);
      const mailService: MailerService = await app.get(
        `services.${MailerService.name}`,
      );

      const res = await mailService.sendMail({
        template: 'test',
        context: {
          name: 'loopback4-mailer',
          engine: 'pug',
        },
      });

      expect(res).to.be.ok();
      expect(res.messageId).to.be.String();
      const html = await getStream(res.message);
      expect(html).to.match(
        /This is a loopback4-mailer component with pug template engine/,
      );
    });

    it('Handblears', async () => {
      app
        .bind(MailerBindings.TEMPLATE_ADAPTER)
        .toProvider(HandlebarsAdapterProvider);
      const config = {
        transports: [
          {
            name: 'default',
            transport: {streamTransport: true},
          },
        ],
        template: {
          dir: path.join(__dirname, '..', '..', '..', 'templates'),
        },
      };
      app.configure(MailerBindings.CONFIG).to(config);
      const mailService: MailerService = await app.get(
        `services.${MailerService.name}`,
      );

      const res = await mailService.sendMail({
        template: 'test',
        context: {
          name: 'loopback4-mailer',
          engine: 'handblears',
        },
      });

      expect(res).to.be.ok();
      expect(res.messageId).to.be.String();
      const html = await getStream(res.message);
      expect(html).to.match(
        /This is a loopback4-mailer component with handblears template engine/,
      );
    });
  });

  async function givenAppWithDefaultConfig() {
    app = givenApplication();
    app.component(MailerComponent);
    await app.start();
  }

  function givenApplication() {
    return new Application();
  }
});
