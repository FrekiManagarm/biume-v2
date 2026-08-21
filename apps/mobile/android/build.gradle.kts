allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

val newBuildDir: Directory =
    rootProject.layout.buildDirectory
        .dir("../../build")
        .get()
rootProject.layout.buildDirectory.value(newBuildDir)

subprojects {
    val newSubprojectBuildDir: Directory = newBuildDir.dir(project.name)
    project.layout.buildDirectory.value(newSubprojectBuildDir)
}
/**
 * Aligne la version de compilation des greffons sur celle réellement installée.
 *
 * `flutter_secure_storage` demande `android-37`, mais le SDK ne publie cette
 * plateforme que sous le nom `android-37.0` : le paquet `platforms;android-37`
 * n'existe pas. C'est un décalage d'outillage, pas un choix de projet, et cette
 * ligne saute dès que les deux nommages se rejoignent.
 */
subprojects {
    afterEvaluate {
        extensions.findByName("android")?.let { android ->
            (android as com.android.build.gradle.BaseExtension).apply {
                compileSdkVersion(36)
            }
        }
    }
}

subprojects {
    project.evaluationDependsOn(":app")
}


tasks.register<Delete>("clean") {
    delete(rootProject.layout.buildDirectory)
}
