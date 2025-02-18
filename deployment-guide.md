# Deployment Guide

This guide outlines the steps needed to deploy the serverless Notes backend application.

## Prerequisites
1. AWS Account with appropriate permissions
2. Node.js and npm installed
3. Serverless Framework CLI installed globally (`npm install -g serverless`)
4. AWS CLI configured with credentials

## Deployment Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure AWS Credentials**
   ```bash
   aws configure
   ```
   Enter your AWS Access Key ID, Secret Access Key, and preferred region.

3. **Deploy to AWS**
   ```bash
   serverless deploy --stage prod
   ```
   This will:
   - Package all the functions
   - Create CloudFormation stack
   - Deploy API Gateway endpoints
   - Deploy Lambda functions
   - Set up necessary IAM roles

4. **Verify Deployment**
   - Check AWS Console for deployed resources
   - Test API endpoints using the provided API Gateway URL

## Continuous Integration/Deployment

The project uses AWS CodeBuild for CI/CD, configured in `buildspec.yml`. The build process:
1. Installs dependencies
2. Runs tests (when implemented)
3. Deploys to AWS using Serverless Framework

## Additional Notes
- The application uses custom domain management through `serverless-domain-manager`
- Local development can be done using `serverless-offline`
- Database migrations should be run separately using the migration plan in `rds-migration-plan.md`

## Rollback
To rollback to a previous version:
```bash
serverless rollback -t TIMESTAMP
```

## Monitoring
Monitor the application using:
- AWS CloudWatch Logs
- API Gateway metrics
- Lambda metrics