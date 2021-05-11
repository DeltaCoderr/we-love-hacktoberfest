import { Message } from "discord.js";
import { ExtendedClientInterface } from "../interfaces/ExtendedClientInterface";
import { _moduleList } from "../modules/_moduleList";
import { errorHandler } from "../utils/errorHandler";

export const onMessage = async (
  message: Message,
  client: ExtendedClientInterface
): Promise<void> => {
  try {
    // Bypass these restrictions in an explicit development environment
    if (process.env.NODE_ENV !== "development") {
      if (Date.now() - client.timer <= client.cooldown) {
        return;
      }

      if (process.env.TARGET_CHANNEL !== message.channel.id) {
        return;
      }
    }

    //bot ignores itself
    if (message.author.id === client.user?.id) {
      return;
    }

    const responses: string[] = [];
    let toSay = false;

    for (const module of _moduleList) {
      if (module.validator(message)) {
        responses.push(module.generator());
        toSay = true;
      }
    }

    if (toSay) {
      await message.react("💜");
      await message.channel.send(responses.join("\n"));
      client.timer = Date.now();
    }
  } catch (err) {
    errorHandler("message event", err);
  }
};
