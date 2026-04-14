import { Controller, ForbiddenException, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { AppUser } from '../auth/types/app-user.type';
import { DashboardService } from './dashboard.service';

@ApiTags('dashboard')
@ApiSecurity('JWT-auth')
@Controller('dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get('stats')
    @ApiBearerAuth()
    @RequirePermission('manage:events')
    @ApiOperation({ summary: 'Get dashboard stats' })
    @ApiResponse({ status: 200, description: 'Returns dashboard stats' })
    @ApiResponse({ status: 401, description: 'Unauthorized - Authentication required' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
    async getStats(@GetUser() user: AppUser) {
        const isAdmin = user.platformRoles?.some((role) => role.name === 'Admin');

        if (!isAdmin) {
            throw new ForbiddenException('Only Admin users can access dashboard stats');
        }

        return this.dashboardService.getStats();
    }
}
