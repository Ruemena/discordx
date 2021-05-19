import {
  Client as ClientJS,
  Interaction,
} from "discord.js";
import * as Glob from "glob";
import {
  MetadataStorage,
  LoadClass,
  ClientOptions,
  DiscordEvents,
  DOn,
  GuardFunction,
} from ".";
import { DDiscord, DSlash } from "./decorators";

export class Client extends ClientJS {
  private _silent: boolean;
  private _loadClasses: LoadClass[] = [];
  private static _requiredByDefault: boolean = false;
  private static _slashGuilds: string[] = [];
  private static _guards: GuardFunction[] = [];

  static get slashGuilds() {
    return Client._slashGuilds;
  }
  static set slashGuilds(value) {
    Client._slashGuilds = value;
  }
  get slashGuilds() {
    return Client._slashGuilds;
  }
  set slashGuilds(value) {
    Client._slashGuilds = value;
  }

  static get requiredByDefault() {
    return Client._requiredByDefault;
  }
  static set requiredByDefault(value) {
    Client._requiredByDefault = value;
  }
  get requiredByDefault() {
    return Client._requiredByDefault;
  }
  set requiredByDefault(value) {
    Client._requiredByDefault = value;
  }

  static get guards() {
    return Client._guards;
  }
  static set guards(value) {
    Client._guards = value;
  }
  get guards() {
    return Client.guards;
  }
  set guards(value) {
    Client._guards = value;
  }

  static get slashes() {
    return MetadataStorage.instance.slashes as readonly DSlash[];
  }
  get slashes() {
    return Client.slashes;
  }

  static get events() {
    return MetadataStorage.instance.events as readonly DOn[];
  }
  get events() {
    return Client.events;
  }

  static get discords() {
    return MetadataStorage.instance.discords as readonly DDiscord[];
  }
  get discord() {
    return Client.discords;
  }

  static get decorators() {
    return MetadataStorage.instance;
  }
  get decorators() {
    return MetadataStorage.instance;
  }

  get silent() {
    return this._silent;
  }
  set silent(value: boolean) {
    this._silent = value;
  }

  /**
   * Create your bot
   * @param options { silent: boolean, loadClasses: LoadClass[] }
   */
  constructor(options?: ClientOptions) {
    super(options);

    this._silent = options?.silent !== undefined || false;
    this._loadClasses = options?.classes || [];
    this.guards = options.guards || [];
    this.requiredByDefault = options.requiredByDefault;
    this.slashGuilds = options.slashGuilds || [];
  }

  /**
   * Start your bot
   * @param token The bot token
   * @param loadClasses A list of glob path or classes
   */
  login(token: string, ...loadClasses: LoadClass[]) {
    if (loadClasses.length > 0) {
      this._loadClasses = loadClasses;
    }

    this.build();

    if (!this.silent) {
      console.log("Events");
      this.events.map((event) => {
        const eventName = event.event;
        console.log(`   ${eventName}: ${event.classRef.name}.${event.key}`);
      });

      console.log("Slash");
      this.slashes.map((slash) => {
        console.log(`   ${slash.name}: ${slash.classRef.name}.${slash.key}`);
      });
    }

    this.decorators.usedEvents.map(async (on) => {
      if (on.once) {
        this.once(
          on.event as any,
          this.decorators.trigger(on.event, this, true)
        );
      } else {
        this.on(
          on.event as any,
          this.decorators.trigger(on.event, this)
        );
      }
    });

    return super.login(token);
  }

  /**
   * Initialize all the @Slash with their permissions
   */
  async initSlashes() {
    await Promise.all(
      this.slashes.map(async (slash) => {
        // Init all the @Slash
        if (slash.guilds.length > 0) {
          // If the @Slash is guild specific, add it to the guild
          await Promise.all(
            slash.guilds.map(async (guild) => {
              const commands = this.guilds.cache.get(guild).commands;
              const command = await commands.create(slash.toObject());

              if (slash.permissions.length <= 0) return;

              await commands.setPermissions(command, slash.getPermissions());
            })
          );
        } else {
          // If the @Slash is global, add it globaly
          const commands = this.application.commands;
          const command = await commands.create(slash.toObject());

          if (slash.permissions.length <= 0) return;

          await commands.setPermissions(command, slash.getPermissions());
        }
      })
    );
  }

  /**
   * Fetch the existing slash commands of a guild or globaly
   * @param guild The guild ID (empty -> globaly)
   * @returns The existing commands
   */
  async fetchSlash(guild?: string) {
    if (guild) {
      return await this.guilds.cache.get(guild).commands.fetch();
    }
    return await this.application.commands.fetch();
  }

  /**
   * Clear the Slash commands globaly or for some guilds
   * @param guilds The guild IDs (empty -> globaly)
   */
  async clearSlashes(...guilds: string[]) {
    if (guilds.length > 0) {
      await Promise.all(
        guilds.map(async (guild) => {
          // Select and delete the commands of each guild
          const commands = await this.fetchSlash(guild);
          await Promise.all(
            commands.map(async (value) => {
              await this.guilds.cache.get(guild).commands.delete(value);
            })
          );
        })
      );
    } else {
      // Select and delete the commands of each guild
      const commands = await this.fetchSlash();
      await Promise.all(
        commands.map(async (value) => {
          await this.application.commands.delete(value);
        })
      );
    }
  }

  /**
   * Execute the corresponding @Slash command based on an Interaction instance
   * @param interaction The discord.js interaction instance
   * @returns void
   */
  async executeSlash(interaction: Interaction) {
    // If the interaction isn't a slash command, return
    if (!interaction.isCommand()) return;

    // Find the corresponding @Slash
    const command = this.slashes.find((slash) => {
      return slash.name === interaction.commandName;
    });

    if (!command) return;

    // Parse the options values and inject it into the @Slash method
    await command.execute(interaction, this);
  }

  /**
   * Manually build the app
   */
  async build() {
    this.loadClasses();
    await this.decorators.build();
  }

  /**
   * Manually trigger an event (used for tests)
   * @param event The event
   * @param params Params to inject
   * @param once Trigger an once event
   */
  trigger(
    event: DiscordEvents,
    params?: any,
    once: boolean = false
  ): Promise<any[]> {
    return this.decorators.trigger(event, this, once)(params);
  }

  private loadClasses() {
    if (this._loadClasses) {
      this._loadClasses.map((file) => {
        if (typeof file === "string") {
          const files = Glob.sync(file);
          files.map((file) => {
            require(file);
          });
        }
      });
    }
  }
}
