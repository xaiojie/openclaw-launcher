import { Module } from '@nestjs/common';
import { InstallersController } from './installers.controller';
import { InstallersService } from './installers.service';
@Module({ controllers: [InstallersController], providers: [InstallersService] })
export class InstallersModule {}
