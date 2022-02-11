FROM node

ENV user=DD2480-Group-18
ENV repo_name=Continuous-Integration
ENV branch=master

# Update aptitude with new repo
RUN apt-get update

# Install software 
RUN apt-get install -y git
# Make ssh dir
RUN mkdir /root/.ssh/

# Copy over private key, and set permissions
# Warning! Anyone who gets their hands on this image will be able
# to retrieve this private key file from the corresponding image layer
ADD id_rsa /root/.ssh/id_rsa
RUN chmod -R 700 /root/.ssh/id_rsa

# Create known_hosts
RUN touch /root/.ssh/known_hosts
# Add github key
RUN ssh-keyscan github.com >> /root/.ssh/known_hosts

# Clone the conf files into the docker container
RUN git clone git@github.com:${user}/${repo_name}.git /app --branch ${branch}

WORKDIR /app

# Install dependencies
RUN ["npm", "install"]

# Build
RUN ["npm", "run", "build"]
