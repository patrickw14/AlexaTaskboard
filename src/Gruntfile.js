var grunt = require('grunt');
grunt.loadNpmTasks('grunt-aws-lambda');
grunt.loadNpmTasks('grunt-contrib-watch');
grunt.loadNpmTasks('grunt-notify');

grunt.initConfig({
    lambda_invoke: {
        default: {
        }
    },
    lambda_deploy: {
        default: {
            arn: 'arn:aws:lambda:us-east-1:501073523575:function:snTaskBoard'
        }
    },
    lambda_package: {
        default: {
        }
    },
    watch: {
      js: {
        files: ['*.js'],
        tasks: ['deploy']
      }
    },
    notify: {
        deploy: {
          options: {
            title: 'Deployment Complete',  // optional
            message: 'Lambda package has been deployed to AWS', //required
          }
        }
    }
});

grunt.registerTask('deploy', ['lambda_package', 'lambda_deploy', 'notify:deploy']);
