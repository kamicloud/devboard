import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity({
  name: 'git_hotfixed_commits',
})
export class GitHotfixedCommit {
  @PrimaryGeneratedColumn({ name: 'sha1_7' })
  sha: string;

  @Column()
  repository: string;

  @Column({ name: 'parent_branch' })
  parentBranch: string;

  @Column({
    name: 'admin_id',
  })
  adminId: string;

  @Column({
    name: 'admin_name',
  })
  adminName: string;

  @Column({ name: 'is_temp' })
  isTemp: boolean;

  branch?: string;
}
