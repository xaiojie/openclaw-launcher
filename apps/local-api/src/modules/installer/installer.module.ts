import { Module } from '@nestjs/common';
import { RuntimeModule } from '../runtime/runtime.module';
import { InstallerController } from './installer.controller';
import { InstallerService } from './installer.service';

@Module({
  imports: [RuntimeModule],
  controllers: [InstallerController],
  providers: [InstallerService],
  exports: [InstallerService]
})
export class InstallerModule {}
