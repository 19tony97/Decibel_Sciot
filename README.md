# **Decibel** Project

<p align="center">
<img src="https://github.com/19tony97/Decibel_Sciot/blob/main/doc/logo.jpg" alt="drawing..." width="410"/>
</p>

## Summary

[- Introduction](#Introduction): brief introduction to the problem\
[- Architecture](#Architecture): architecture of the idea\
[- Project structure](#Project-structure): how the project is organized\
[- Getting started](#Getting-started): guide to run the project

## Introduction

The idea is to **simulate a decibel sensor** placed in any workplace due **to warn** the worker **when the decibel level is too high for its ears**.\
When the user is notified, **he can choose** from a Telegram bot, which of the following situation he is in:

- The worker is using PPE (Personal protective equipment);
- The worker is NOT using PPE (Personal protective equipment).
          
The whole project is based on **simulated** things due to unaccesibility over the sensors and workplaces.

## Architecture

The main goal of this project is to simulate the sending of data by an Iot sensor (in this case a decibel sensor).\
This can be done in two ways:

- using the function '**_sendrandomdecibel_**' on Nuclio;
- using a MQTT client from your smartphone:
  - iOS: [EasyMQTT](https://apps.apple.com/it/app/easymqtt/id1523099606)
  - Android: [MQTT Dash (IoT, Smart home)](https://play.google.com/store/apps/details?id=net.routix.mqttdash)

The data is an integer value **between 0 and 150** and indicates the **decibel's level in the air** of the workplace. This value is published in the queue '**iot/sensors/decibel**' of **RabbitMQ**.

When a value is published in this queue, a function on Nuclio (**_consumedecibel_**) is triggered, which processes this value. This function checks if the decibel's level is too high (**>90**) and, if so, publish a new message in the queue '**_iot/alerts_**', otherwise log it by publishing it in the queue '**_iot/logs_**'.

At this point, inside **telegram_bot.js** the publication in **_iot/alerts_** is intercepted and a message is sent to the user thanks to a **Telegram bot**.

The user chooses in which situation he is in but, of course, the action is only simulated for the reasons mentioned in the previous paragraph.

<p align="center">
<img src="https://github.com/19tony97/Decibel_Sciot/blob/main/doc/architecture.jpg" alt="drawing..."/>
</p>

## Project structure

- src/
  - _**telegram_bot.js**_: takes care of communication from/to bot
  - _**logger.js**_: takes care of printing both the decibel's level when is **not** too high, and the user’s response from the bot
- yaml_functions/
  - _**sendrandomdecibel.yaml**_: takes care of sending a random value to the queue **iot/sensors/decibel**
  - _**consumedecibel.yaml**_: takes care of processing received values and to warn the user or log data
- **doc/**: everything related to documentation
- **.env**: file containing settings for javascript scripts

## Getting started

> Note: Decibel requires [Node.js](https://nodejs.org/) and [Docker](https://www.docker.com/products/docker-desktop) to run.

From **two different** terminals, start the docker to run RabbitMQ and Nuclio with these following commands:

- **Docker RabbitMQ**:

  ```sh
  docker run -p 9000:15672  -p 1883:1883 -p 5672:5672  cyrilix/rabbitmq-mqtt
  ```

- **Docker Nuclio**:

  ```sh
  docker run -p 8070:8070 -v /var/run/docker.sock:/var/run/docker.sock -v /tmp:/tmp nuclio/dashboard:stable-amd64
  ```

- **Update and deploy Functions**:

  - Type '**localhost:8070**' on your browser to open the homepage of Nuclio;
  - Create new project and call it '_Decibel_';
  - Press '**Create function**', '**Import**' and upload the two functions that are in the **yaml_functions** folder;
  - In both, **change the already present IP with your IP**;\
    **!!!Don't forget the trigger!!!**
  - Press **'Deploy'**.

- **Create personal Telegram Bot**:

  - Open Telegram and search for [BotFather](https://t.me/BotFather).
  - Press **start** and type **/newbot**.
  - Give it a **name** and a **unique id** (BotFather will help you).
  - Copy and paste the **Token** that BotFather gave you in the **Telegraf constructor** in [.env](.env) file;

- **Install all dependencies, start Telegram Bot's Server and start Logger**:

  Open again **.env** file and insert your **IP address** instead of '_INSERT_YOUR_IP_'.

  Open **two more** terminals and type, from the **root of the project**, on the first:

  ```sh
  npm install
  node telegram_bot.js
  ```

  and on the second:

  ```sh
  node logger.js
  ```

- **Start Telegram Bot Client**:

  Now, you can go to the bot you've just created on Telegram and run it.

  The bot will warn you not to stop it to continue receiving updates on the plant.

After all these steps, you are able to send a value using both **sendrandomdecibel** on Nuclio and an **MQTT client** from your smartphone and if this value is **higher than 90** you will be notified on the bot.

Below will be presented a short **demo** of the execution of the project.

## Demo

https://user-images.githubusercontent.com/54476194/132891234-de4d51d6-74e9-4ec6-877a-eff94adf7c90.mp4
