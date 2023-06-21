# loopback4-mailer

## Installation

Install CloudfrontComponent using `npm`;

```sh
$ npm install @digital-garage-to/loopback4-mailer
```

### Basic Use

Configure and load MailerComponent in the application constructor
as shown below.

```ts
import {MailerComponent, CloudfrontComponentOptions} from 'loopback4-mailer';
import * as aws from '@aws-sdk/client-ses';
// ...

const ses = new aws.SES({
  apiVersion: "2010-12-01",
  region: "us-east-1",
  defaultProvider,
});

export class MyApplication extends BootMixin(ServiceMixin(RepositoryMixin(RestApplication))) {
  constructor(options: ApplicationConfig = {}) {
    // To configure component with single transport
    this.configure(MailerBindings.CONFIG).to({
      transport: [
        {
          name: 'default',
          transport: {
            streamTransport: true,
          }
        }
      ]
    });

    // To configure component with multiple transport
    this.configure(MailerBindings.CONFIG).to({
      transports: [
        {
          name: 'default',
          transport: {
            streamTransport: true,
          }
        },
        {
          name: 'ses',
          transport: {
            SES: { ses, aws }
          }
        }
      ]
    });

    this.component(MailerComponent);
    // ...
  }
  // ...
}
```

### Usage

Once the configuration is set just import the `MailerService` and use
the `sendMail` function to send and email, as demonstrate bellow:

```ts
import {service} from '@loopback/core';
import {MailerService} from '@digital-garage-to/loopback4-mailer';
import {get} from '@loopback/rest';

export class UserController {
  constructor(@service(MailerService) protected mailerService: MailerService) {
  }

  @get('/users')
  async create() {
    //create user...
    const {email} = user;
    await this.mailerService.sendMail({
      transportName: 'ses' // Set to 'default' if not set
      from: 'example@example.com',
      to: email,
      text: 'Verify your account'
    })
  }
}
```

### Template adapter

```ts

```

### Debug

To display debug messages from this package, you can use the next command:

```shell
DEBUG=loopback:mailer npm run start
```

### Tests

Run `npm test` from the root folder.

### Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

This project is licensed under the [MIT](LICENSE.md)
