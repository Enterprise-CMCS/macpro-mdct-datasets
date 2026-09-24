import { Construct } from "constructs";
import {
  aws_s3 as s3,
  aws_guardduty as guardduty,
  aws_iam as iam,
  RemovalPolicy,
  Aws,
  Duration,
} from "aws-cdk-lib";

interface CreateUploadsComponentsProps {
  scope: Construct;
  loggingBucket: s3.IBucket;
  isDev: boolean;
  uploadsBucketName: string;
}

/**
 * Creates a bucket for managing universal dataset uploads
 * Files should be uploaded as /{dataset}/{state}/{fileId}
 */
export function createUploadsComponents(props: CreateUploadsComponentsProps) {
  const { scope, loggingBucket, isDev, uploadsBucketName } = props;

  const uploadsBucket = new s3.Bucket(scope, "DataSetBucket", {
    bucketName: uploadsBucketName,
    autoDeleteObjects: isDev,
    encryption: s3.BucketEncryption.S3_MANAGED,
    versioned: true,
    removalPolicy: isDev ? RemovalPolicy.DESTROY : RemovalPolicy.RETAIN,
    publicReadAccess: false,
    blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_PREFERRED,
    cors: [
      {
        allowedOrigins: ["*"],
        allowedMethods: [
          s3.HttpMethods.GET,
          s3.HttpMethods.PUT,
          s3.HttpMethods.POST,
          s3.HttpMethods.DELETE,
          s3.HttpMethods.HEAD,
        ],
        allowedHeaders: ["*"],
        exposedHeaders: ["ETag"],
        maxAge: 3000, // 50 minutes
      },
    ],
    enforceSSL: true,
    serverAccessLogsBucket: loggingBucket,
    serverAccessLogsPrefix: `AWSLogs/${Aws.ACCOUNT_ID}/s3/`,
  });

  const s3MalwareProtectionRole = new iam.Role(
    scope,
    "DataSetS3MalwareProtectionRole",
    {
      assumedBy: new iam.ServicePrincipal(
        "malware-protection-plan.guardduty.amazonaws.com"
      ),
      inlinePolicies: {
        S3MalwareProtectionPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              sid: "AllowEventBridgeManagement",
              effect: iam.Effect.ALLOW,
              actions: ["events:*"],
              resources: [
                `arn:aws:events:us-east-1:${Aws.ACCOUNT_ID}:rule/DO-NOT-DELETE-AmazonGuardDutyMalwareProtectionS3*`,
              ],
              conditions: {
                StringLike: {
                  "events:ManagedBy":
                    "malware-protection-plan.guardduty.amazonaws.com",
                },
              },
            }),
            new iam.PolicyStatement({
              sid: "AllowS3Operations",
              effect: iam.Effect.ALLOW,
              actions: [
                "s3:GetObject*",
                "s3:PutObject*",
                "s3:ListBucket",
                "s3:*Notification",
                "s3:*Tagging",
              ],
              resources: [
                uploadsBucket.bucketArn,
                `${uploadsBucket.bucketArn}/*`,
              ],
            }),
          ],
        }),
      },
    }
  );

  uploadsBucket.addToResourcePolicy(
    new iam.PolicyStatement({
      actions: ["s3:GetObject"],
      effect: iam.Effect.DENY,
      resources: [`${uploadsBucket.bucketArn}/*`],
      principals: [new iam.ArnPrincipal("*")],
      conditions: {
        StringNotEquals: {
          "s3:ExistingObjectTag/GuardDutyMalwareScanStatus": "NO_THREATS_FOUND",
        },
        ArnNotLike: {
          "aws:ResourceArn": `${uploadsBucket.bucketArn}/zips/*`,
        },
      },
    })
  );

  uploadsBucket.addToResourcePolicy(
    new iam.PolicyStatement({
      actions: ["s3:PutObject"],
      effect: iam.Effect.DENY,
      principals: [new iam.ArnPrincipal("*")],
      notResources: [
        `${uploadsBucket.bucketArn}/*.bmp`,
        `${uploadsBucket.bucketArn}/*.txt`,
        `${uploadsBucket.bucketArn}/*.csv`,
        `${uploadsBucket.bucketArn}/*.jar`,
        `${uploadsBucket.bucketArn}/*.odt`,
        `${uploadsBucket.bucketArn}/*.ods`,
        `${uploadsBucket.bucketArn}/*.odp`,
        `${uploadsBucket.bucketArn}/*.msg`,
        `${uploadsBucket.bucketArn}/*.potx`,
        `${uploadsBucket.bucketArn}/*.pptx`,
        `${uploadsBucket.bucketArn}/*.ppt`,
        `${uploadsBucket.bucketArn}/*.rtf`,
        `${uploadsBucket.bucketArn}/*.tif`,
        `${uploadsBucket.bucketArn}/*.gif`,
        `${uploadsBucket.bucketArn}/*.jpeg`,
        `${uploadsBucket.bucketArn}/*.png`,
        `${uploadsBucket.bucketArn}/*.docm`,
        `${uploadsBucket.bucketArn}/*.docx`,
        `${uploadsBucket.bucketArn}/*.doc`,
        `${uploadsBucket.bucketArn}/*.pdf`,
        `${uploadsBucket.bucketArn}/*.jpg`,
        `${uploadsBucket.bucketArn}/*.xlsx`,
        `${uploadsBucket.bucketArn}/*.zip`,
        `${uploadsBucket.bucketArn}/*.xltx`,
        `${uploadsBucket.bucketArn}/*.xls`,
        `${uploadsBucket.bucketArn}/*.xml`,
      ],
    })
  );

  uploadsBucket.addLifecycleRule({
    tagFilters: { auto_delete_category: "generated_zip" },
    expiration: Duration.days(1),
  });

  new guardduty.CfnMalwareProtectionPlan(
    scope,
    "DataSetMalwareProtectionPlan",
    {
      actions: {
        tagging: {
          status: "ENABLED",
        },
      },
      protectedResource: {
        s3Bucket: {
          bucketName: uploadsBucketName,
        },
      },
      role: s3MalwareProtectionRole.roleArn,
    }
  );

  return uploadsBucket;
}
