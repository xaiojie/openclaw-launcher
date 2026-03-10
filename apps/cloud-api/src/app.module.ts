import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.validation';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DevicesModule } from './modules/devices/devices.module';
import { PlansModule } from './modules/plans/plans.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { LicensesModule } from './modules/licenses/licenses.module';
import { UsageModule } from './modules/usage/usage.module';
import { UpdatesModule } from './modules/updates/updates.module';
import { InstallersModule } from './modules/installers/installers.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({ imports: [ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }), AuthModule, UsersModule, DevicesModule, PlansModule, SubscriptionsModule, PaymentsModule, LicensesModule, UsageModule, UpdatesModule, InstallersModule, NotificationsModule, AdminModule] })
export class AppModule {}
