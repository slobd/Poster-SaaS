#!/bin/bash

yarn prisma migrate deploy
node dist/main
