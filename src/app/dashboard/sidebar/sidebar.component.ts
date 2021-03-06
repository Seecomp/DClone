import { Component, OnInit, ViewChild } from '@angular/core';
import { UsersService } from '../../services/users.service';
import { GuildService } from '../../services/guild.service';
import { MatDrawer } from '@angular/material/sidenav';
import { WSService } from 'src/app/services/ws.service';
import { LogService } from 'src/app/services/log.service';
import { RTCService } from 'src/app/services/rtc.service';

@Component({
  selector: 'sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  @ViewChild('drawer') drawer: MatDrawer;

  get guilds() { return this.guildService.guilds || []; }
  get user() { return this.userService.user || {}; }

  constructor(
    public guildService: GuildService,
    private userService: UsersService,
    private log: LogService,
    private rtc: RTCService,
    private ws: WSService) {}

  async ngOnInit() {
    await this.guildService.init();
    
    this.hookWSEvents();
  }

  hookWSEvents() {
    this.ws.socket.on('GUILD_MEMBER_ADD', async ({ guild, member }) => {
      this.log.info('GET GUILD_MEMBER_ADD', 'sbar');
      if (member.user._id !== this.user._id) return;
      
      await this.guildService.updateGuilds();
    });
  }

  toggle() {
    const icon = document.querySelector('#nav-icon1');
    icon.classList.toggle('open');
    this.drawer.toggle();
  }

  async disconnect() {
    const guild = this.guildService.getGuild(this.user.voice.guildId);
    const channel = guild.channels.find(c => c._id === this.user.voice.channelId);
    const member = guild.members.find(m => m.user._id === this.user._id);

    const index = channel.memberIds.indexOf(member._id);
    channel.memberIds.splice(index, 1);

    this.user.voice.connected = false;

    this.ws.socket.emit('VOICE_CHANNEL_UPDATE', { channel, guild, user: this.user });
    this.ws.socket.emit('VOICE_STATE_UPDATE', { user: this.user });

    this.rtc.hangUp();
  }

  mute() {
    this.user.voice.selfMuted = !this.user.voice.selfMuted;
    (this.user.voice.selfMuted)
      ? this.rtc.muteMicrophone()
      : this.rtc.unmuteMicrophone();

    this.log.info('SEND VOICE_STATE_UPDATE', 'vc');
    this.ws.socket.emit('VOICE_STATE_UPDATE', { user: this.user });
  }
}
