import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { ModuleConfig } from 'src/app/module-config';
import { GuildService } from 'src/app/services/guild.service';
import { LogService } from 'src/app/services/log.service';
import { WSService } from 'src/app/services/ws.service';

@Component({
  selector: 'app-guild-settings',
  templateUrl: './guild-settings.component.html',
  styleUrls: ['./guild-settings.component.css']
})
export class GuildSettingsComponent extends ModuleConfig implements OnInit {
  constructor(
    route: ActivatedRoute,
    router: Router,
    guildService: GuildService,
    snackbar: MatSnackBar,
    ws: WSService,
    log: LogService) {
      super(guildService, route, snackbar, ws, log, router);
    }

  async ngOnInit() {
    await super.init();

    document.body.onkeyup = ({ key }) => {
      if (key !== 'Escape') return;

      this.close();
    };
  }

  buildForm(guild: any): FormGroup | Promise<FormGroup> {
    return new FormGroup({
      name: new FormControl(guild.name, [ Validators.required, Validators.maxLength(32) ])
    });
  }
}
