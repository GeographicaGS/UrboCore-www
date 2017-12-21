node("docker") {

    currentBuild.result = "SUCCESS"

    try {

        stage "Building"

            checkout scm
            // ${env.GIT_COMMIT} doesn't work D:
            sh "git rev-parse --short HEAD > .git/git_commit"

            branch_name = "${env.BRANCH_NAME}".replaceAll("/", "_")
            git_commit = readFile(".git/git_commit").replace("\n", "").replace("\r", "")
            build_name = "${branch_name}--${git_commit}"

            echo "Building urbo-www/${build_name}"

            if (branch_name == "master") {
              sh "cp src/js/Config.production.js src/js/Config.js"
              deploy_to = "prod"
            }
            else if (branch_name == "staging") {
              sh "cp src/js/Config.staging.js src/js/Config.js"
              deploy_to = "staging"
            }
            else if (branch_name == "dev") {
              sh "cp src/js/Config.dev.js src/js/Config.js"
              deploy_to = "dev"
            }
            else{
              sh "cp src/js/Config.dev.js src/js/Config.js"
            }

            sh "git submodule init && git submodule update"
            sh "docker build --pull=true -t geographica/urbo_core_www ."

        stage "Testing"

            /*
             * Because still there are no tests, we only run the builder
             */

            // sh "docker run -i -e DISPLAY=:99 -e CHROME_BIN=chrome-browser --name urbo_www--${build_name} geographica/urbo_core_www"

            echo "Testing urbo-www/${build_name}"
            // Testing with PhantomJS. TODO: Chrome testing
            // sh "docker run -i -e DISPLAY=:99 -e CHROME_BIN=chrome-browser --rm --name urbo_www--${build_name} geographica/urbo_core_www npm run test"


    } catch (error) {

        currentBuild.result = "FAILURE"
        echo "urbo-www/${build_name} failed: ${error}"
        throw error

    } finally {

        stage "Cleaning"

            // If in the future when we need to clean something of the real tests, this will be the place
            echo "Cleaning urbo-www/${build_name}"

            if (currentBuild.result == "SUCCESS" && ["master", "dev"].contains(branch_name)) {

              stage "Deploying"
                withCredentials([[$class: 'UsernamePasswordMultiBinding',credentialsId: 'dockerhub',usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD']]) {
                  sh "docker login -u ${USERNAME} -p ${PASSWORD}"
                  sh "docker tag geographica/urbo_core_www geographica/urbo_core_www:${deploy_to}"
                  sh "docker push geographica/urbo_core_www:${deploy_to}"
                  sh "ansible urbo-frontend-${deploy_to} -a '/data/app/UrboCore-www/deploy.sh ${branch_name}'"
                }
            }
    }
}
