# -*- coding: utf-8 -*-
# Generated by Django 1.9.1 on 2016-02-15 06:37
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('webapp', '0002_collection_shared_with'),
    ]

    operations = [
        migrations.CreateModel(
            name='Blog',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=120)),
                ('slug', models.SlugField(unique=True)),
                ('sidebar_note', models.CharField(max_length=1024)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('edited_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['title'],
            },
        ),
        migrations.CreateModel(
            name='BlogItem',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('slug', models.SlugField()),
                ('date', models.DateField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('edited_at', models.DateTimeField(auto_now=True)),
                ('blog', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='webapp.Blog')),
            ],
            options={
                'ordering': ['-date'],
            },
        ),
        migrations.CreateModel(
            name='BlogPermission',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('permission', models.CharField(choices=[('O', 'Owner'), ('G', 'Guest')], max_length=1)),
                ('blog', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='webapp.Blog')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='CollectionPermission',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('permission', models.CharField(choices=[('O', 'Owner'), ('G', 'Guest')], max_length=1)),
                ('collection', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='webapp.Collection')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AddField(
            model_name='item',
            name='notes',
            field=models.CharField(default='', max_length=512),
        ),
        migrations.AddField(
            model_name='item',
            name='revision',
            field=models.PositiveIntegerField(default=1),
        ),
        migrations.AddField(
            model_name='item',
            name='typ',
            field=models.CharField(choices=[('E', 'Entry'), ('U', 'URL')], default='E', max_length=1),
        ),
        migrations.AddField(
            model_name='blogitem',
            name='item',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='webapp.Item'),
        ),
        migrations.AlterUniqueTogether(
            name='collectionpermission',
            unique_together=set([('user', 'collection')]),
        ),
        migrations.AlterUniqueTogether(
            name='blogpermission',
            unique_together=set([('user', 'blog')]),
        ),
        migrations.AlterUniqueTogether(
            name='blogitem',
            unique_together=set([('blog', 'slug', 'date')]),
        ),
    ]
