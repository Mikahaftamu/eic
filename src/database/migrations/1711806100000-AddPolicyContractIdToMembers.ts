import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddPolicyContractIdToMembers1711806100000 implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void>
  {
    // Check if the column exists before adding
    const columnExists = await queryRunner.hasColumn('members', 'policyContractId');
    if (!columnExists)
    {
      await queryRunner.addColumn(
        'members',
        new TableColumn({
          name: 'policyContractId',
          type: 'uuid',
          isNullable: true,
        }),
      );
    }

    // Create the foreign key only if it doesn't exist
    const table = await queryRunner.getTable('members');
    const foreignKeyExists = table?.foreignKeys.some(
      (fk) => fk.columnNames.indexOf('policyContractId') !== -1,
    );
    if (!foreignKeyExists)
    {
      await queryRunner.createForeignKey(
        'members',
        new TableForeignKey({
          columnNames: ['policyContractId'],
          referencedColumnNames: ['id'],
          referencedTableName: 'policy_contracts',
          onDelete: 'SET NULL',
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void>
  {
    const table = await queryRunner.getTable('members');
    if (!table)
    {
      throw new Error('Members table not found');
    }

    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('policyContractId') !== -1,
    );
    if (!foreignKey)
    {
      throw new Error('Foreign key for policyContractId not found');
    }

    await queryRunner.dropForeignKey('members', foreignKey);
    await queryRunner.dropColumn('members', 'policyContractId');
  }
}
