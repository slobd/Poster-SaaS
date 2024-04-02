import { INestApplicationContext } from '@nestjs/common'
import { Connection } from 'typeorm'

export async function clearDatabase(
    app: INestApplicationContext,
    cb: () => Promise<void>,
): Promise<void> {
    const connection = app.get(Connection)
    const queryRunner = connection.createQueryRunner()

    // establish real database connection using our new query runner
    await queryRunner.connect()

    // lets now open a new transaction:
    await queryRunner.startTransaction()
    try {
        await queryRunner.query(`DELETE FROM "role_users_user";`)
        await queryRunner.query(`DELETE FROM "type_settings_event";`)
        await queryRunner.query(`DELETE FROM "open_registration";`)
        await queryRunner.query(`DELETE FROM "tenant_theme";`)
        await queryRunner.query(`DELETE FROM "tenant";`)
        await queryRunner.query(`DELETE FROM "role";`)
        await queryRunner.query(`DELETE FROM "poster_keywords_keyword";`)
        await queryRunner.query(`DELETE FROM "keyword";`)
        await queryRunner.query(`DELETE FROM "poster_topics_topic";`)
        await queryRunner.query(`DELETE FROM "topic";`)
        await queryRunner.query(`DELETE FROM "confirm_email_token";`)
        await queryRunner.query(`DELETE FROM "poster_content_images_upload";`)
        await queryRunner.query(`DELETE FROM "poster_content";`)
        await queryRunner.query(`DELETE FROM "comment";`)
        await queryRunner.query(`DELETE FROM "author";`)
        await queryRunner.query(`DELETE FROM "poster";`)
        await queryRunner.query(`DELETE FROM "poster_findings";`)
        // await queryRunner.query(`DELETE FROM "live_session";`)
        await queryRunner.query(`DELETE FROM "user";`)
        await queryRunner.query(`DELETE FROM "upload";`)
        await queryRunner.query(`DELETE FROM "poster_visibility";`)
        await queryRunner.query(`DELETE FROM "poster_type";`)
    } catch (error) {
        console.log(error)
        // since we have errors let's rollback changes we made
        await queryRunner.rollbackTransaction()
        // process.exit(1)
    } finally {
        // you need to release query runner which is manually created:
        await queryRunner.release()
        await cb()
    }
}
