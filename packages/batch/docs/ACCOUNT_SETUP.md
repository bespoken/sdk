# Best Practices for Virtual Device Management
Setting up Virtual Devices and accounts is an important part of using the batch tester.

As the batch tester allows for parallel testing, it is necessary to setup multiple accounts to take advantage of this.

## For Alexa
### Create a Bespoken Dashboard account
Only one Bespoken Dashboard account is required.

Set this up here:  
https://apps.bespoken.io/dashboard

Once configured, we will create multiple virtual devices here. But first...

### Create A New Amazon Account
This account should be associated with the locale where you want to test.

We recommend using an email address such as:
`bespoken-test+us1@gmail.com`

Where many different accounts can be set with the same base email:
`bespoken-test+us2@gmail.com`
`bespoken-test+us3@gmail.com`
`bespoken-test+us4@gmail.com`

All of these emails will be sent to `bespoken.test@gmail.com`, a helpful feature of Gmail.

### Grant access to the test skill for each account [ONLY FOR DEV SKILLS]
The main account that owns the skill to be tested should go and add each account individually.

This can be done via the developer.amazon.com site.

Alternatively, if the skill to be tested is in production, this step can be skipped.

### Enable The Skill
If the skill is in production, it should be enabled in the normal manner.

If the skill is still in dev, go to the developer console for the skill, enter the testing tab, and select "Enable".

### Create A Virtual Device
Go back to the Bespoken Dashboard. Select the Virtual Device Section.

Select "Add Virtual Device". Then be sure to login with the newly created account to associate this Virtual Device with that account.

### Document It!
Perhaps most importantly, write this all down! It is easy to lose track of these configuration settings.

We recommend creating a spreadsheet with the following info:
* Gmail Account Credentials
* Amazon Account Email
* Amazon Account Password
* Virtual Device Token

## For Google Assistant
More details to come...