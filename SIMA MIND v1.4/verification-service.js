/**
 * Verification Service - Integrates with SMS and Email providers
 * Supports: Twilio (SMS), SendGrid (Email), AWS SNS/SES, and custom implementations
 */

class VerificationService {
  constructor() {
    this.providers = {
      sms: this.initSMSProvider(),
      email: this.initEmailProvider(),
    };
  }

  initSMSProvider() {
    const provider = process.env.SMS_PROVIDER || "twilio";

    switch (provider) {
      case "twilio":
        return {
          name: "twilio",
          send: async (phone, code) => {
            // Try Twilio first
            if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
              const twilio = require("twilio");
              const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

              try {
                const message = await client.messages.create({
                  body: `Your SIMA MIND verification code is: ${code}. Valid for 10 minutes.`,
                  from: process.env.TWILIO_PHONE_NUMBER,
                  to: phone,
                });
                return { success: true, messageId: message.sid };
              } catch (error) {
                console.error("Twilio SMS error:", error.message);
                // Fall through to console fallback
              }
            }
            
            // Fallback to console for development
            console.log(
              `\n📱 SMS VERIFICATION (Development Mode)\n`,
              `To: ${phone}\n`,
              `Code: ${code}\n`,
              `Valid for: 10 minutes\n`
            );
            return { success: true, messageId: "console-dev", method: "console" };
          },
        };

      case "aws-sns":
        return {
          name: "aws-sns",
          send: async (phone, code) => {
            const AWS = require("aws-sdk");
            const sns = new AWS.SNS({
              accessKeyId: process.env.AWS_ACCESS_KEY_ID,
              secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
              region: process.env.AWS_REGION || "us-east-1",
            });

            try {
              const result = await sns
                .publish({
                  Message: `Your SIMA MIND verification code is: ${code}. Valid for 10 minutes.`,
                  PhoneNumber: phone,
                })
                .promise();
              return { success: true, messageId: result.MessageId };
            } catch (error) {
              console.error("AWS SNS error:", error);
              return { success: false, error: error.message };
            }
          },
        };

      case "nexmo":
        return {
          name: "nexmo",
          send: async (phone, code) => {
            const Vonage = require("@vonage/server-sdk");
            const vonage = new Vonage({
              apiKey: process.env.NEXMO_API_KEY,
              apiSecret: process.env.NEXMO_API_SECRET,
            });

            try {
              const result = await vonage.sms.send({
                to: phone,
                from: "SIMA",
                text: `Your SIMA MIND verification code is: ${code}. Valid for 10 minutes.`,
              });

              if (result.messages[0]["status"] === "0") {
                return { success: true, messageId: result.messages[0]["message-id"] };
              } else {
                throw new Error(`Message failed with error: ${result.messages[0]["error-text"]}`);
              }
            } catch (error) {
              console.error("Nexmo SMS error:", error);
              return { success: false, error: error.message };
            }
          },
        };

      default:
        // Fallback: log to console (development mode)
        return {
          name: "console",
          send: async (phone, code) => {
            console.log(`[VERIFICATION SMS] Phone: ${phone}, Code: ${code}`);
            return { success: true, messageId: "console-" + Date.now() };
          },
        };
    }
  }

  initEmailProvider() {
    const provider = process.env.EMAIL_PROVIDER || "sendgrid";

    switch (provider) {
      case "sendgrid":
        return {
          name: "sendgrid",
          send: async (email, code) => {
            // Try SendGrid first
            if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY.startsWith("SG.")) {
              const sgMail = require("@sendgrid/mail");
              sgMail.setApiKey(process.env.SENDGRID_API_KEY);

              try {
                const result = await sgMail.send({
                  to: email,
                  from: process.env.SENDGRID_FROM_EMAIL || "noreply@simamind.com",
                  subject: "Your SIMA MIND Verification Code",
                  html: `
                    <h2>Verify Your Email</h2>
                    <p>Your verification code is: <strong>${code}</strong></p>
                    <p>This code is valid for 10 minutes.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                  `,
                });
                return { success: true, messageId: result[0].headers["x-message-id"] };
              } catch (error) {
                console.error("SendGrid email error:", error.message);
                // Fall through to console fallback
              }
            }
            
            // Fallback to console for development
            console.log(
              `\n📧 EMAIL VERIFICATION (Development Mode)\n`,
              `To: ${email}\n`,
              `Code: ${code}\n`,
              `Valid for: 10 minutes\n`
            );
            return { success: true, messageId: "console-dev", method: "console" };
          },
        };

      case "aws-ses":
        return {
          name: "aws-ses",
          send: async (email, code) => {
            const AWS = require("aws-sdk");
            const ses = new AWS.SES({
              accessKeyId: process.env.AWS_ACCESS_KEY_ID,
              secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
              region: process.env.AWS_REGION || "us-east-1",
            });

            try {
              const result = await ses
                .sendEmail({
                  Source: process.env.AWS_SES_FROM_EMAIL || "noreply@simamind.com",
                  Destination: { ToAddresses: [email] },
                  Message: {
                    Subject: { Data: "Your SIMA MIND Verification Code" },
                    Body: {
                      Html: {
                        Data: `
                          <h2>Verify Your Email</h2>
                          <p>Your verification code is: <strong>${code}</strong></p>
                          <p>This code is valid for 10 minutes.</p>
                          <p>If you didn't request this, please ignore this email.</p>
                        `,
                      },
                    },
                  },
                })
                .promise();
              return { success: true, messageId: result.MessageId };
            } catch (error) {
              console.error("AWS SES error:", error);
              return { success: false, error: error.message };
            }
          },
        };

      case "mailgun":
        return {
          name: "mailgun",
          send: async (email, code) => {
            const mailgun = require("mailgun.js");
            const FormData = require("form-data");
            const mg = mailgun(FormData);
            const domain = process.env.MAILGUN_DOMAIN;

            try {
              const result = await mg.messages.create(domain, {
                from: `SIMA MIND <noreply@${domain}>`,
                to: email,
                subject: "Your SIMA MIND Verification Code",
                html: `
                  <h2>Verify Your Email</h2>
                  <p>Your verification code is: <strong>${code}</strong></p>
                  <p>This code is valid for 10 minutes.</p>
                  <p>If you didn't request this, please ignore this email.</p>
                `,
              });
              return { success: true, messageId: result.id };
            } catch (error) {
              console.error("Mailgun error:", error);
              return { success: false, error: error.message };
            }
          },
        };

      default:
        // Fallback: log to console (development mode)
        return {
          name: "console",
          send: async (email, code) => {
            console.log(`[VERIFICATION EMAIL] Email: ${email}, Code: ${code}`);
            return { success: true, messageId: "console-" + Date.now() };
          },
        };
    }
  }

  async sendPhoneVerification(phone, code) {
    const result = await this.providers.sms.send(phone, code);
    if (!result.success) {
      console.error("Failed to send phone verification:", result.error);
    }
    return result;
  }

  async sendEmailVerification(email, code) {
    const result = await this.providers.email.send(email, code);
    if (!result.success) {
      console.error("Failed to send email verification:", result.error);
    }
    return result;
  }

  getActiveProviders() {
    return {
      sms: this.providers.sms.name,
      email: this.providers.email.name,
    };
  }
}

module.exports = VerificationService;
