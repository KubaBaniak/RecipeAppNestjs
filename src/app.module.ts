import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { RecipeModule } from './recipe/recipe.module';

@Module({
  imports: [AuthModule, UserModule, RecipeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
