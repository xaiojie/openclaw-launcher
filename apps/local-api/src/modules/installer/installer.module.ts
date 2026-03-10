import { Module } from '@nestjs/common';
import { InstallerController } from './installer.controller';
import { InstallerService } from './installer.service';
@Module({ controllers: [InstallerController], providers: [InstallerService], exports: [InstallerService] })
export class InstallerModule {}
