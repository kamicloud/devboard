import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity({
  name: 'git_deploy_history'
})
export class GitDeployHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'link_time',
  })
  linkTime: string;

  @Column({
    name: 'sha1',
  })
  sha1: string;

  @Column()
  repository: string;

  @Column()
  branch: string;

  @Column({
    name: 'site_name',
  })
  siteName: string;

  @Column({
    name: 'admin_id',
  })
  adminId: string;

  @Column({
    name: 'admin_name',
  })
  adminName: string;

  @Column({
    name: 'deployment_status',
  })
  deploymentStatus: string;

  @Column()
  release: string;

  @Column({ name: 'is_hidden' })
  isHidden: boolean;
}
