import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.validation';
import { AuthModule } from './modules/auth/auth.module';
import { LicenseModule } from './modules/license/license.module';
import { InstallerModule } from './modules/installer/installer.module';
import { RuntimeModule } from './modules/runtime/runtime.module';
import { AssistantsModule } from './modules/assistants/assistants.module';
import { PlansModule } from './modules/plans/plans.module';
import { BillingModule } from './modules/billing/billing.module';
import { ModelsModule } from './modules/models/models.module';
import { ChannelsModule } from './modules/channels/channels.module';
import { UpdatesModule } from './modules/updates/updates.module';
import { LogsModule } from './modules/logs/logs.module';
import { HealthModule } from './modules/health/health.module';
import { ConfigModule as LocalConfigModule } from './modules/config/config.module';

@Module({ imports: [ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }), AuthModule, LicenseModule, InstallerModule, RuntimeModule, AssistantsModule, PlansModule, BillingModule, ModelsModule, ChannelsModule, UpdatesModule, LogsModule, HealthModule, LocalConfigModule] })
export class AppModule {}
