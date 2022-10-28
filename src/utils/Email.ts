import * as nodemailer from 'nodemailer';
import fs from 'fs';

interface IUser {
  email: string;
  name: string;
}

class Email {
  private to: string;

  private firstName: string;

  private url: string;

  private from: string;

  public constructor(user: IUser, url: string) {
    this.to = user.email;
    // eslint-disable-next-line prefer-destructuring
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Murilo Sanches <${process.env.EMAIL_FROM}>`;
  }

  // eslint-disable-next-line class-methods-use-this
  public newTransport() {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(subject: string) {
    // const html = new Promise((resolve, reject) => {
    //   resolve(fs.readFileSync('src/views/emails/resetpassword.html', 'utf-8'));
    //   reject();
    // });
    // html.then((data) => String(data)).catch((err) => console.log('\x1b[35m%s\x1b[0m', err));
    let html = fs.readFileSync('src/views/emails/resetpassword.html', 'utf-8');
    html = html
      .replace('{{%USER_NAME%}}', this.firstName)
      .replace('{{%RESET_URL%}}', this.url)
      .replace('{{%USER_EMAIL%}}', this.to);
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
    };

    await this.newTransport().sendMail(mailOptions);
  }

  public async sendPasswordReset() {
    await this.send('Seu token para recuperação de senha (válido por apenas 1 hora)');
  }
}

export default Email;
